import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    provider!: User;

    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    description!: string;

    @Prop({ required: true })
    category!: string;

    @Prop({ type: [String] })
    tags?: string[];

    @Prop({ type: Number, required: true })
    basePrice!: number;

    @Prop({ type: [String] })
    images?: string[];

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ default: 0 })
    ratingAverage!: number;

    @Prop({ default: 0 })
    ratingCount!: number;

    @Prop({ default: null })
    deletedAt?: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.index({ title: 'text' });
