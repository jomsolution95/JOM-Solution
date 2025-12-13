import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PremiumQuotaDocument = PremiumQuota & Document;

@Schema({ timestamps: true })
export class PremiumQuota {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true })
    plan!: string;

    @Prop({ required: true })
    quotaType!: string;

    @Prop({ required: true })
    total!: number;

    @Prop({ required: true, default: 0 })
    used!: number;

    @Prop({ required: true })
    remaining!: number;

    @Prop({ required: true })
    period!: string;

    @Prop({ default: false })
    isDefault!: boolean;

    @Prop()
    resetDate?: Date;
}

export const PremiumQuotaSchema = SchemaFactory.createForClass(PremiumQuota);

// Indexes
PremiumQuotaSchema.index({ userId: 1, quotaType: 1 });
PremiumQuotaSchema.index({ plan: 1, isDefault: 1 });
