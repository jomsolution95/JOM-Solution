import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Order } from './order.schema';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
    PAYMENT = 'payment',
    REFUND = 'refund',
    WITHDRAWAL = 'withdrawal',
    DEPOSIT = 'deposit',
    SUBSCRIPTION = 'subscription',
}

export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export enum PaymentProvider {
    WAVE = 'WAVE',
    ORANGE_MONEY = 'ORANGE_MONEY',
    STRIPE = 'STRIPE',
    SYSTEM = 'SYSTEM',
}

@Schema({ timestamps: true })
export class Transaction {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user!: User; // Payer or Payee depending on context, or we stick to payer/payee? Let's use user for the owner of the record generally, but maybe payer/payee is clearer.
    // The previous schema had payer/payee. Let's checking previous file content...
    // Previous content had payer and payee.

    @Prop({ type: Types.ObjectId, ref: 'User' })
    payer?: User;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    payee?: User;

    @Prop({ type: Types.ObjectId, ref: 'Order' })
    order?: Order;

    @Prop({ required: true })
    amount!: number;

    @Prop({ default: 'XOF' })
    currency!: string;

    @Prop({ required: true, enum: TransactionType })
    type!: TransactionType;

    @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PENDING })
    status!: TransactionStatus;

    @Prop({ enum: PaymentProvider })
    provider?: PaymentProvider;

    @Prop()
    externalId?: string; // ID from Wave/OM

    @Prop()
    description?: string;

    @Prop({ type: Object })
    metadata?: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
