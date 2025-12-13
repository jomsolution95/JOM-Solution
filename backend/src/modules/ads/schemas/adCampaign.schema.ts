import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdCampaignDocument = AdCampaign & Document;

export enum CampaignStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    PAUSED = 'paused',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum AdPlacement {
    HOME_BANNER = 'home_banner',
    HOME_SIDEBAR = 'home_sidebar',
    SOCIAL_FEED = 'social_feed',
    JOBS_LISTING = 'jobs_listing',
    JOBS_SIDEBAR = 'jobs_sidebar',
}

@Schema({ timestamps: true })
export class AdCampaign {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    advertiserId!: Types.ObjectId;

    @Prop({ required: true })
    name!: string;

    @Prop()
    description?: string;

    @Prop({ required: true, enum: CampaignStatus, default: CampaignStatus.DRAFT })
    status!: CampaignStatus;

    @Prop({ required: true })
    imageUrl!: string;

    @Prop({ required: true })
    targetUrl!: string;

    @Prop({ required: true })
    headline!: string;

    @Prop()
    bodyText?: string;

    @Prop({ type: [String], enum: AdPlacement, required: true })
    placements!: AdPlacement[];

    // Targeting
    @Prop({ type: Object })
    targeting!: {
        cities?: string[];
        sectors?: string[];
        ageMin?: number;
        ageMax?: number;
        gender?: string;
        interests?: string[];
    };

    // Budget & Billing
    @Prop({ required: true })
    budget!: number;

    @Prop({ required: true, default: 1000 })
    cpmRate!: number; // Cost per 1000 impressions in FCFA

    @Prop({ required: true, default: 0 })
    spent!: number;

    // Schedule
    @Prop({ required: true })
    startDate!: Date;

    @Prop({ required: true })
    endDate!: Date;

    // Performance
    @Prop({ required: true, default: 0 })
    impressions!: number;

    @Prop({ required: true, default: 0 })
    clicks!: number;

    @Prop({ required: true, default: 0 })
    ctr!: number; // Click-through rate

    @Prop({ type: Object })
    metadata?: {
        createdBy?: string;
        lastModifiedBy?: string;
        notes?: string;
    };
}

export const AdCampaignSchema = SchemaFactory.createForClass(AdCampaign);

// Indexes
AdCampaignSchema.index({ advertiserId: 1, status: 1 });
AdCampaignSchema.index({ status: 1, startDate: 1, endDate: 1 });
AdCampaignSchema.index({ placements: 1, status: 1 });

// Calculate CTR before save
AdCampaignSchema.pre('save', function (next) {
    if (this.impressions > 0) {
        this.ctr = (this.clicks / this.impressions) * 100;
    }
    next();
});
