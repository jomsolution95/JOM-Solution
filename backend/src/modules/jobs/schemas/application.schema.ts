import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Job } from './job.schema';

export type ApplicationDocument = Application & Document;

export enum ApplicationStatus {
    PENDING = 'pending',
    REVIEWING = 'reviewing',
    INTERVIEW = 'interview',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Application {
    @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
    job!: Job;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    applicant!: User;

    @Prop()
    coverLetter?: string;

    @Prop({ type: [String] })
    attachments?: string[]; // URLs

    @Prop({ enum: ApplicationStatus, default: ApplicationStatus.PENDING })
    status!: ApplicationStatus;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications
