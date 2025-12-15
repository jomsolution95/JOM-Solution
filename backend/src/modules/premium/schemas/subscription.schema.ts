import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

export enum SubscriptionPlan {
    INDIVIDUAL_PRO = 'individual-pro',
    COMPANY_BIZ = 'company-biz',
    SCHOOL_EDU = 'school-edu',
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
    TRIAL = 'trial',
    SUSPENDED = 'suspended',
}

export interface PaymentHistoryItem {
    date: Date;
    amount: number;
    currency: string;
    method: string;
    transactionId: string;
    status: 'success' | 'failed' | 'pending';
}

export interface QuotasUsed {
    cvViews?: number;
    jobPosts?: number;
    courseUploads?: number;
    studentSlots?: number;
    boosts?: number;
}

@Schema({ timestamps: true })
export class Subscription {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(SubscriptionPlan) })
    plan!: SubscriptionPlan;

    @Prop({ required: true, enum: Object.values(SubscriptionStatus), default: SubscriptionStatus.TRIAL })
    status!: SubscriptionStatus;

    @Prop({ required: true, enum: ['monthly', 'yearly'], default: 'monthly' })
    billingCycle!: 'monthly' | 'yearly';

    @Prop({ required: true })
    startDate!: Date;

    @Prop({ required: true })
    endDate!: Date;

    @Prop({ default: false })
    autoRenew!: boolean;

    @Prop({ type: Object, default: {} })
    quotasUsed!: QuotasUsed;

    @Prop({ type: [Object], default: [] })
    paymentHistory!: PaymentHistoryItem[];

    @Prop()
    cancelledAt?: Date;

    @Prop()
    cancelReason?: string;

    @Prop({ default: 0 })
    price!: number;

    @Prop({ default: 'FCFA' })
    currency!: string;

    @Prop()
    trialEndsAt?: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Indexes
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1 });
SubscriptionSchema.index({ status: 1 });
