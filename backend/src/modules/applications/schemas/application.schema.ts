
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ApplicationStatus {
    PENDING = 'pending',
    REVIEWING = 'reviewing',
    INTERVIEW = 'interview',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
    @Prop({ type: Types.ObjectId, ref: 'Job', required: true, index: true })
    jobId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    applicantId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Cv' }) // Link to the specific CV used
    cvId?: Types.ObjectId;

    @Prop({ enum: ApplicationStatus, default: ApplicationStatus.PENDING })
    status!: ApplicationStatus;

    @Prop()
    coverLetter?: string;

    @Prop({ type: Object })
    metadata?: any;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true }); // Prevent duplicate applications
