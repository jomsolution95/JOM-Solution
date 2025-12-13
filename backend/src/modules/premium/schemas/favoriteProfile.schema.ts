import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteProfileDocument = FavoriteProfile & Document;

@Schema({ timestamps: true })
export class FavoriteProfile {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    recruiterId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    profileId!: Types.ObjectId;

    @Prop()
    notes?: string;

    @Prop({ type: Object })
    metadata?: {
        addedAt?: Date;
        lastViewed?: Date;
        tags?: string[];
        rating?: number;
    };
}

export const FavoriteProfileSchema = SchemaFactory.createForClass(FavoriteProfile);

// Indexes
FavoriteProfileSchema.index({ recruiterId: 1, profileId: 1 }, { unique: true });
FavoriteProfileSchema.index({ recruiterId: 1, createdAt: -1 });
