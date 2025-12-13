import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
    SYSTEM = 'system',
    MESSAGE = 'message',
    ORDER_UPDATE = 'order_update',
    JOB_APPLICATION = 'job_application',
    PAYMENT = 'payment',
    FOLLOWER = 'follower',
    ORDER = 'order', // For new service orders
}

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    recipient!: User;

    @Prop({ required: true, enum: NotificationType })
    type!: NotificationType;

    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    message!: string;

    @Prop()
    link?: string; // Action URL

    @Prop({ default: false })
    isRead!: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ recipient: 1, isRead: 1 });
