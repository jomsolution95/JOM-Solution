import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Escrow, EscrowDocument } from '../services/schemas/escrow.schema';
import { Order, OrderDocument } from '../services/schemas/order.schema';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Escrow.name) private escrowModel: Model<EscrowDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) { }

    async getGlobalStats() {
        const [userCount, escrowTotal, orderCount, verifPending] = await Promise.all([
            this.userModel.countDocuments(),
            this.escrowModel.aggregate([
                { $match: { status: 'HELD' } },
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
            .select('+email +roles +isVerified +isActive') // Explicitly select protected fields
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await this.userModel.countDocuments();

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            }
        };
    }

    async banUser(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        // Prevent banning other Super Admins
        if (user.roles.includes(UserRole.SUPER_ADMIN)) {
            throw new Error('Cannot ban a Super Admin');
        }

        user.isActive = false;
        // user.roles = []; // Optional: Strip roles
        return user.save();
    }
}
