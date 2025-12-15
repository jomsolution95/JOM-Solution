import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ScheduledTaskDocument = ScheduledTask & Document;

@Schema({ timestamps: true })
export class ScheduledTask {
    @Prop({ required: true, enum: ['BROADCAST', 'AD_BOOST', 'EMAIL_CAMPAIGN'] })
    action!: string;

    @Prop({ type: Object, required: true })
    payload!: any;

    @Prop({ required: true })
    executeAt!: Date;

    @Prop({ enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' })
    status!: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId;

    @Prop()
    errorLog?: string;
}

export const ScheduledTaskSchema = SchemaFactory.createForClass(ScheduledTask);
