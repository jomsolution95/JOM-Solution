
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    admin!: User;

    @Prop({ required: true })
    action!: string; // e.g., 'BAN_USER', 'RELEASE_FUNDS'

    @Prop({ type: Types.ObjectId }) // Can be User ID, Order ID, etc.
    targetId?: Types.ObjectId;

    @Prop()
    targetModel?: string; // 'User', 'Order', etc.

    @Prop({ type: Object })
    details?: Record<string, any>;

    @Prop()
    ipAddress?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
