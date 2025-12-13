import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    user?: Types.ObjectId;

    @Prop({ required: true })
    method!: string;

    @Prop({ required: true })
    path!: string;

    @Prop()
    ip?: string;

    @Prop({ type: Object })
    body?: any; // Be careful not to log sensitive data (password)

    @Prop()
    statusCode?: number;

    @Prop()
    duration?: number;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
