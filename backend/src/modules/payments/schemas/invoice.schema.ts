import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Order } from '../../services/schemas/order.schema';
import { Transaction } from '../../services/schemas/transaction.schema';

export type InvoiceDocument = Invoice & Document;

export enum InvoiceStatus {
    PAID = 'PAID',
    REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true })
export class Invoice {
    @Prop({ required: true, unique: true })
    invoiceNumber!: string; // e.g., INV-2025-0001

    @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
    order!: Order;

    @Prop({ type: Types.ObjectId, ref: 'Transaction', required: true })
    transaction!: Transaction;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    buyer!: User;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    seller!: User;

    @Prop({ type: [{ title: String, quantity: Number, unitPrice: Number }], required: true })
    items!: Array<{ title: string; quantity: number; unitPrice: number }>;

    @Prop({ required: true })
    subtotal!: number;

    @Prop({ required: true, default: 0 })
    fees!: number; // Platform commission

    @Prop({ required: true })
    total!: number;

    @Prop({ required: true })
    pdfUrl!: string; // Local path to PDF file

    @Prop({ enum: InvoiceStatus, default: InvoiceStatus.PAID })
    status!: InvoiceStatus;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ seller: 1 });
