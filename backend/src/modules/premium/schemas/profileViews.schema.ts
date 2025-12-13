import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProfileViewDocument = ProfileView & Document;

@Schema({ timestamps: true })
export class ProfileView {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    profileId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    viewerId?: Types.ObjectId;

    @Prop({ required: true, default: () => new Date() })
    date!: Date;

    @Prop()
    source?: string; // 'search', 'recommendation', 'direct', 'job_application'

    @Prop()
    ipAddress?: string;

    @Prop()
    userAgent?: string;

    @Prop()
    referrer?: string;

    @Prop({ default: false })
    isAnonymous!: boolean;

    @Prop({ type: Object })
    metadata?: {
        searchQuery?: string;
        jobId?: string;
        location?: string;
        device?: string;
    };
}

export const ProfileViewSchema = SchemaFactory.createForClass(ProfileView);

// Indexes
ProfileViewSchema.index({ profileId: 1, date: -1 });
ProfileViewSchema.index({ viewerId: 1, date: -1 });
ProfileViewSchema.index({ profileId: 1, viewerId: 1 });
ProfileViewSchema.index({ date: -1 });

// Compound index for analytics
ProfileViewSchema.index({ profileId: 1, source: 1, date: -1 });
