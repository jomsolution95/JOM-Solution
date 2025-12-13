import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Service } from './service.schema';

export type OrderDocument = Order & Document;

export enum OrderStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    DELIVERED = 'delivered',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    DISPUTED = 'disputed',
}

@Schema({ timestamps: true })
export class Order {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    buyer!: User;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    seller!: User;

    @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
    service!: Service;

    @Prop({ required: true })
    amount!: number;

    @Prop({ enum: OrderStatus, default: OrderStatus.PENDING })
    status!: OrderStatus;

    @Prop()
    requirements?: string;

    @Prop()
    deliveryDate?: Date;

    // Delivery & Secure Workflow Fields
    @Prop()
    deliveredAt?: Date;

    @Prop()
    autoConfirmAt?: Date;

    @Prop({ type: [String] })
    deliveredFiles?: string[]; // URLs of files delivered by seller
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ buyer: 1 });
OrderSchema.index({ seller: 1 });
