import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Escrow, EscrowDocument, EscrowStatus } from '../services/schemas/escrow.schema';
import { Order, OrderDocument } from '../services/schemas/order.schema';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class EscrowService {
    constructor(
        @InjectModel(Escrow.name) private escrowModel: Model<EscrowDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        private readonly walletService: WalletService,
    ) { }

    async createEscrow(transactionId: string, amount: number, orderId: string): Promise<Escrow> {
        const escrow = await this.escrowModel.create({
            order: orderId,
            transaction: transactionId,
            amount,
            status: EscrowStatus.HELD,
        });

        // Update Order Status
        await this.orderModel.findByIdAndUpdate(orderId, { status: 'in_progress' }); // Assuming 'in_progress' or 'paid'

        return escrow;
    }

    async releaseFunds(escrowId: string): Promise<Escrow> {
        const escrow = await this.escrowModel.findById(escrowId);
        if (!escrow) throw new NotFoundException('Escrow record not found');
        return this.processRelease(escrow);
    }

    async releaseFundsByOrder(orderId: string): Promise<Escrow> {
        const escrow = await this.escrowModel.findOne({ order: orderId });
        if (!escrow) throw new NotFoundException('Escrow record not found for this order');
        return this.processRelease(escrow);
    }

    private async processRelease(escrow: EscrowDocument): Promise<Escrow> {
        if (escrow.status !== EscrowStatus.HELD) {
            // Idempotency: if already released, just return
            if (escrow.status === EscrowStatus.RELEASED) return escrow;
            throw new BadRequestException(`Funds are ${escrow.status}`);
        }

        // 1. Calculate Split
        const commissionRate = 0.10; // 10%
        const totalAmount = escrow.amount;
        const commission = totalAmount * commissionRate;
        const sellerEarnings = totalAmount - commission;

        // 2. Fetch Order to get Seller ID
        const order = await this.orderModel.findById(escrow.order);
        if (!order) throw new NotFoundException('Linked order not found');

        // 3. Credit Seller Wallet
        await this.walletService.credit(
            order.seller.toString(),
            sellerEarnings,
            `Earnings for Order #${order._id} (Commission: 10%)`,
            order._id.toString()
        );

        // 4. Update Escrow
        escrow.status = EscrowStatus.RELEASED;
        escrow.releasedAt = new Date();

        // Update Order if not already (redundant safety)
        if (order.status !== 'completed') {
            await this.orderModel.findByIdAndUpdate(order._id, { status: 'completed' });
        }

        return escrow.save();
    }

    async refundFunds(escrowId: string): Promise<Escrow> {
        const escrow = await this.escrowModel.findById(escrowId);
        if (!escrow) throw new NotFoundException('Escrow not found');

        escrow.status = EscrowStatus.REFUNDED;
        escrow.refundedAt = new Date();
        await escrow.save();

        // TODO: Trigger Refund Transaction logic

        return escrow;
    }
}
