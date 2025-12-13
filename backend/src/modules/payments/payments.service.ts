import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument, TransactionStatus, TransactionType, PaymentProvider } from '../services/schemas/transaction.schema';
import { Order, OrderDocument } from '../services/schemas/order.schema';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { EscrowService } from '../escrow/escrow.service';
import { InvoicingService } from './services/invoicing.service';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @Inject(forwardRef(() => EscrowService)) private readonly escrowService: EscrowService,
        private readonly invoicingService: InvoicingService,
    ) { }

    async initiatePayment(userId: string, dto: InitiatePaymentDto): Promise<any> {
        const order = await this.orderModel.findById(dto.orderId);
        if (!order) throw new NotFoundException('Order not found');

        const transaction = new this.transactionModel({
            user: userId,
            payer: userId,
            payee: order.seller,
            order: order._id,
            amount: order.amount,
            currency: 'XOF',
            type: TransactionType.PAYMENT,
            status: TransactionStatus.PENDING,
            provider: dto.provider,
            description: `Payment for Order #${order._id}`,
        });

        await transaction.save();

        if (dto.provider === PaymentProvider.SYSTEM) {
            return this.mockSuccess(transaction);
        }

        return {
            status: 'initiated',
            transactionId: transaction._id,
            message: `Please confirm payment on your mobile (${dto.provider})`,
            providerReference: `MOCK-${Date.now()}`
        };
    }

    private async mockSuccess(transaction: TransactionDocument) {
        transaction.status = TransactionStatus.COMPLETED;
        transaction.externalId = `SYS-${Date.now()}`;
        await transaction.save();

        // 1. Escrow Funds
        await this.escrowService.createEscrow(transaction._id.toString(), transaction.amount, transaction.order?.toString() || '');

        // 2. Generate Invoice
        // We need to fetch full order details (buyer/seller) to generate PDF
        const fullOrder = await this.orderModel.findById(transaction.order)
            .populate('buyer')
            .populate('seller')
            .populate('service');

        if (fullOrder) {
            await this.invoicingService.generateInvoice(fullOrder, transaction);
        }

        return { status: 'success', transaction };
    }

    async handleWebhook(payload: any): Promise<void> {
        const { externalId, status, transactionId } = payload;
        const transaction = await this.transactionModel.findById(transactionId);
        if (!transaction) return;

        if (status === 'success') {
            if (transaction.status === TransactionStatus.COMPLETED) return;
            transaction.status = TransactionStatus.COMPLETED;
            transaction.externalId = externalId;
            await transaction.save();

            await this.escrowService.createEscrow(transaction._id.toString(), transaction.amount, transaction.order?.toString() || '');

            // Generate Invoice
            const fullOrder = await this.orderModel.findById(transaction.order)
                .populate('buyer')
                .populate('seller')
                .populate('service');

            if (fullOrder) {
                await this.invoicingService.generateInvoice(fullOrder, transaction);
            }

        } else if (status === 'failed') {
            transaction.status = TransactionStatus.FAILED;
            await transaction.save();
        }
    }
}
