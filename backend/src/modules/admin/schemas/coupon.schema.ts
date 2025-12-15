import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
    @Prop({ required: true, unique: true, uppercase: true, trim: true })
    code: string;

    @Prop({ required: true, enum: ['PERCENTAGE', 'FIXED'] })
    discountType: string;

    @Prop({ required: true })
    amount: number;

    @Prop({ default: null })
    maxUses: number;

    @Prop({ default: 0 })
    usedCount: number;

    @Prop({ default: null })
    expiryDate: Date;

    @Prop({ default: true })
    isActive: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
