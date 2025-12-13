import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdImpressionDocument = AdImpression & Document;

@Schema({ timestamps: true })
export class AdImpression {
    @Prop({ type: Types.ObjectId, ref: 'AdCampaign', required: true, index: true })
    campaignId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId?: Types.ObjectId;

    @Prop({ required: true })
    placement!: string;

    @Prop({ required: true, default: false })
    clicked!: boolean;

    @Prop()
    clickedAt?: Date;

    @Prop({ type: Object })
    userContext?: {
        city?: string;
        sector?: string;
        age?: number;
        gender?: string;
    };

    @Prop()
    ipAddress?: string;

    @Prop()
    userAgent?: string;

    @Prop({ required: true })
    impressionDate!: Date;
}

export const AdImpressionSchema = SchemaFactory.createForClass(AdImpression);

// Indexes
AdImpressionSchema.index({ campaignId: 1, impressionDate: -1 });
AdImpressionSchema.index({ campaignId: 1, clicked: 1 });
AdImpressionSchema.index({ userId: 1, impressionDate: -1 });
