import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BoostDocument = Boost & Document;

export enum BoostType {
    PROFILE_STAR = 'profile_star',
    PROFILE_URGENT = 'profile_urgent',
    JOB_FEATURED = 'job_featured',
    JOB_URGENT = 'job_urgent',
    JOB_PUSH_NOTIFICATION = 'job_push_notification',
    TRAINING_FEATURED = 'training_featured',
    TRAINING_OPEN_HOUSE = 'training_open_house',
    TRAINING_EMAIL_CAMPAIGN = 'training_email_campaign',
    APPLICATION_RELANCE = 'application_relance',
}

export enum BoostStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled',
    PENDING = 'pending',
}

@Schema({ timestamps: true })
export class Boost {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(BoostType) })
    type!: BoostType;

    @Prop({ type: Types.ObjectId, required: true })
    targetId!: Types.ObjectId;

    @Prop()
    targetType?: string; // 'profile', 'job', 'training', 'application'

    @Prop({ required: true })
    startDate!: Date;

    @Prop({ required: true })
    endDate!: Date;

    @Prop({ required: true, enum: Object.values(BoostStatus), default: BoostStatus.PENDING })
    status!: BoostStatus;

    @Prop({ required: true })
    price!: number;

    @Prop({ default: 'FCFA' })
    currency!: string;

    @Prop()
    paymentId?: string;

    @Prop({ type: Object })
    analytics?: {
        views?: number;
        clicks?: number;
        applications?: number;
        conversions?: number;
    };

    @Prop({ type: Object })
    metadata?: Record<string, any>;
}

export const BoostSchema = SchemaFactory.createForClass(Boost);

// Indexes
BoostSchema.index({ userId: 1, status: 1 });
BoostSchema.index({ targetId: 1, type: 1 });
BoostSchema.index({ endDate: 1 });
BoostSchema.index({ status: 1, endDate: 1 });

// Methods
BoostSchema.methods.isActive = function (): boolean {
    const now = new Date();
    return (
        this.status === BoostStatus.ACTIVE &&
        this.startDate <= now &&
        this.endDate >= now
    );
};

BoostSchema.methods.expire = async function (): Promise<void> {
    this.status = BoostStatus.EXPIRED;
    await this.save();
};
