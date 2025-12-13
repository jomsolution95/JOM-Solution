import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PremiumQuotaDocument = PremiumQuota & Document & {
    hasQuotaAvailable(): boolean;
    getRemainingQuota(): number;
    incrementUsage(amount?: number): Promise<void>;
    resetQuota(): Promise<void>;
};

export enum QuotaType {
    CV_VIEWS = 'cv_views',
    JOB_POSTS = 'job_posts',
    COURSE_UPLOADS = 'course_uploads',
    STUDENT_SLOTS = 'student_slots',
    PROFILE_BOOSTS = 'profile_boosts',
    JOB_BOOSTS = 'job_boosts',
    TRAINING_BOOSTS = 'training_boosts',
    MESSAGES = 'messages',
    APPLICATIONS = 'applications',
    PUSH_NOTIFICATIONS = 'push_notifications',
}

@Schema({ timestamps: true })
export class PremiumQuota {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: Object.values(QuotaType) })
    quotaType!: QuotaType;

    @Prop({ required: true, default: 0 })
    used!: number;

    @Prop({ required: true })
    limit!: number;

    @Prop({ required: true })
    periodStart!: Date;

    @Prop({ required: true })
    periodEnd!: Date;

    @Prop({ default: false })
    unlimited!: boolean;

    @Prop({ type: Object })
    metadata?: Record<string, any>;
}

export const PremiumQuotaSchema = SchemaFactory.createForClass(PremiumQuota);

// Indexes
PremiumQuotaSchema.index({ userId: 1, quotaType: 1 }, { unique: true });
PremiumQuotaSchema.index({ periodEnd: 1 });

// Methods
PremiumQuotaSchema.methods.hasQuotaAvailable = function (): boolean {
    if (this.unlimited) return true;
    return this.used < this.limit;
};

PremiumQuotaSchema.methods.getRemainingQuota = function (): number {
    if (this.unlimited) return Infinity;
    return Math.max(0, this.limit - this.used);
};

PremiumQuotaSchema.methods.incrementUsage = async function (amount: number = 1): Promise<void> {
    this.used += amount;
    await this.save();
};

PremiumQuotaSchema.methods.resetQuota = async function (): Promise<void> {
    this.used = 0;
    await this.save();
};
