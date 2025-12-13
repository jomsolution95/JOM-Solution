import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Service } from './service.schema';

export type RatingDocument = Rating & Document;

@Schema({ timestamps: true })
export class Rating {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    reviewer!: User;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    targetUser!: User; // Seller or Provider

    @Prop({ type: Types.ObjectId, ref: 'Service' })
    service?: Service;

    @Prop({ required: true, min: 1, max: 5 })
    score!: number;

    @Prop()
    comment?: string;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
RatingSchema.index({ targetUser: 1 });
