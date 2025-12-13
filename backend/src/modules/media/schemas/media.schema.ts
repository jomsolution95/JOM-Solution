import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type MediaDocument = Media & Document;

export enum MediaType {
    IMAGE = 'image',
    VIDEO = 'video',
    DOCUMENT = 'document',
    OTHER = 'other',
}

@Schema({ timestamps: true })
export class Media {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    owner!: User;

    @Prop({ required: true })
    url!: string;

    @Prop({ required: true })
    filename!: string; // Original filename

    @Prop({ enum: MediaType, required: true })
    type!: MediaType;

    @Prop()
    mimeType?: string;

    @Prop()
    size?: number; // in bytes
}

export const MediaSchema = SchemaFactory.createForClass(Media);
