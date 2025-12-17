import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Escrow, EscrowDocument } from '../services/schemas/escrow.schema';
import { Order, OrderDocument } from '../services/schemas/order.schema';
import { AdminAuditLog, AdminAuditLogDocument } from './schemas/audit-log.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { AdsService } from '../ads/ads.service';
import { CampaignStatus } from '../ads/schemas/adCampaign.schema';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Escrow.name) private escrowModel: Model<EscrowDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(AdminAuditLog.name) private auditLogModel: Model<AdminAuditLogDocument>,
        private readonly notificationsService: NotificationsService,
        private readonly adsService: AdsService,
    ) { }



    // --- ADS MANAGEMENT ---

    async getAdCampaigns(status?: string) {
        return this.adsService.getAllCampaigns(status);
    }

    async reviewAdCampaign(campaignId: string, action: 'APPROVE' | 'REJECT' | 'STOP', adminId: string) {
        let status: CampaignStatus;
        switch (action) {
            case 'APPROVE': status = CampaignStatus.ACTIVE; break;
            case 'REJECT': status = CampaignStatus.CANCELLED; break; // Or REJECTED if enum exists
            case 'STOP': status = CampaignStatus.PAUSED; break; // Or COMPLETED
            default: throw new Error('Invalid action');
        }

        const campaign = await this.adsService.updateCampaign(campaignId, { status });

        await this.logAction(
            adminId,
            `AD_${action}`,
            campaignId,
            'AdCampaign',
            { action, status }
        );

        return campaign;
    }


    async getGlobalStats() {
        const [userCount, escrowTotal, orderCount, verifPending] = await Promise.all([
            this.userModel.countDocuments(),
            this.escrowModel.aggregate([
                { $match: { status: 'held' } }, // Case sensitive match? schema default is 'held'
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            this.orderModel.countDocuments(),
            this.userModel.countDocuments({ isVerified: false }),
        ]);

        return {
            users: userCount,
            escrowHeld: escrowTotal[0]?.total || 0,
            orders: orderCount,
            pendingVerifications: verifPending,
        };
    }

    async getAllUsers(limit = 50, page = 1) {
        const skip = (page - 1) * limit;
        const users = await this.userModel.find()
            .select('+email +roles +isVerified +isActive')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await this.userModel.countDocuments();

        return {
            data: users,
            meta: { total, page, limit, pages: Math.ceil(total / limit) }
        };
    }

    async banUser(userId: string, adminId?: string) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        if (user.roles.includes(UserRole.SUPER_ADMIN)) {
            throw new Error('Cannot ban a Super Admin');
        }

        user.isActive = false;
        await user.save();

        if (adminId) {
            await this.logAction(adminId, 'BAN_USER', userId, 'User', { reason: 'Admin Action' });
        }

        return user;
    }

    // --- AUDIT LOGS ---

    async logAction(adminId: string, action: string, targetId?: string, targetModel?: string, details?: any) {
        return this.auditLogModel.create({
            admin: new Types.ObjectId(adminId),
            action,
            targetId: targetId ? new Types.ObjectId(targetId) : undefined,
            targetModel,
            details
        });
    }

    async getAuditLogs(limit = 50, page = 1) {
        const skip = (page - 1) * limit;
        const logs = await this.auditLogModel.find()
            .populate('admin', 'email roles')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await this.auditLogModel.countDocuments();

        return {
            data: logs,
            meta: { total, page, limit, pages: Math.ceil(total / limit) }
        };
    }

    // --- FINANCES ---

    async getEscrowTransactions(limit = 50, page = 1) {
        const skip = (page - 1) * limit;
        const escrows = await this.escrowModel.find()
            .populate({
                path: 'order',
                select: 'buyer seller service status',
                populate: [
                    { path: 'buyer', select: 'email' },
                    { path: 'seller', select: 'email' },
                    { path: 'service', select: 'title' }
                ]
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await this.escrowModel.countDocuments();

        return {
            data: escrows,
            meta: { total, page, limit, pages: Math.ceil(total / limit) }
        };
    }

    async resolveEscrow(escrowId: string, decision: 'RELEASE' | 'REFUND', adminId: string) {
        const escrow = await this.escrowModel.findById(escrowId).populate('order');
        if (!escrow) throw new NotFoundException('Escrow not found');

        if (escrow.status !== 'held') {
            throw new Error(`Cannot resolve escrow with status ${escrow.status}`);
        }

        const newStatus = decision === 'RELEASE' ? 'released' : 'refunded';
        escrow.status = newStatus as any; // Cast to enum type if needed

        // Update Order status too for consistency
        if (escrow.order) {
            // Use standard mongoose populated field access or any cast if strict types block it
            const orderId = (escrow.order as any)._id || escrow.order;
            const order = await this.orderModel.findById(orderId);
            if (order) {
                // Cast string to OrderStatus enum (assuming values match)
                order.status = (decision === 'RELEASE' ? 'completed' : 'cancelled') as any;
                await order.save();
            }
        }

        await escrow.save();

        await this.logAction(
            adminId,
            decision === 'RELEASE' ? 'RELEASE_FUNDS' : 'REFUND_FUNDS',
            escrowId,
            'Escrow',
            { decision, amount: escrow.amount, reason: 'Super Admin Intervention' }
        );

        return escrow;
    }

    // --- KYC ---

    async getPendingKYC(limit = 50, page = 1) {
        const skip = (page - 1) * limit;
        const users = await this.userModel.find({ kycStatus: 'PENDING' })
            .select('+email +kycDocuments +kycStatus')
            .sort({ createdAt: 1 }) // Oldest first
            .skip(skip)
            .limit(limit);

        const total = await this.userModel.countDocuments({ kycStatus: 'PENDING' });

        return {
            data: users,
            meta: { total, page, limit, pages: Math.ceil(total / limit) }
        };
    }

    async reviewKYC(userId: string, decision: 'APPROVE' | 'REJECT', reason: string | undefined, adminId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        if (decision === 'APPROVE') {
            user.kycStatus = 'APPROVED';
            user.isVerified = true;
            user.kycRejectionReason = undefined;
        } else {
            user.kycStatus = 'REJECTED';
            user.isVerified = false;
            user.kycRejectionReason = reason;
        }

        await user.save();

        await this.logAction(
            adminId,
            decision === 'APPROVE' ? 'APPROVE_KYC' : 'REJECT_KYC',
            userId,
            'User',
            { decision, reason }
        );


        return user;
    }

    async broadcastMessage(title: string, message: string, targetRole: string = 'ALL', filters?: any, adminId?: string) {
        let query: any = {};
        if (targetRole !== 'ALL') {
            query.roles = targetRole;
        }

        // Advanced Filters
        if (filters) {
            if (filters.isVerified) query.isVerified = true;
            // if (filters.hasPremium) ... implement premium check logic or role check
        }

        const users = await this.userModel.find(query).select('_id');
        let count = 0;

        for (const user of users) {
            try {
                await this.notificationsService.send(user._id.toString(), 'system' as any, title, message);
                count++;
            } catch (err) {
                console.error(`Failed to send broadcast to ${user._id}`, err);
            }
        }

        if (adminId) {
            await this.logAction(
                adminId,
                'BROADCAST_SENT',
                undefined,
                'System',
                { title, targetRole, filters, count }
            );
        }

        return { count };
    }
}
