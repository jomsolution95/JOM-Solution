import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type JobDocument = Job & Document;

export enum JobType {
    FULL_TIME = 'full_time',
    PART_TIME = 'part_time',
    FREELANCE = 'freelance',
    INTERNSHIP = 'internship',
}

export enum JobStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    CLOSED = 'closed',
    ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Job {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    employer!: User;

    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    description!: string;

    @Prop({ type: [String] })
    requirements?: string[];

    @Prop({ enum: JobType, required: true })
    type!: JobType;

    @Prop()
    budget?: string; // e.g. "50k-60k" or "Hourly"

    @Prop()
    location?: string;

    @Prop({ default: false })
    isRemote!: boolean;

    @Prop({ enum: JobStatus, default: JobStatus.DRAFT })
    status!: JobStatus;

    @Prop()
    expiresAt?: Date;

    @Prop({ default: false })
    deletedAt?: Date;

    @Prop({ default: false })
    autoBroadcast?: boolean;

    @Prop({ default: false })
    broadcasted?: boolean;

    @Prop()
    broadcastedAt?: Date;

    @Prop({ default: false })
    isPremium?: boolean;
}

export const JobSchema = SchemaFactory.createForClass(Job);
JobSchema.index({ title: 'text', description: 'text' });
JobSchema.index({ title: 'text', description: 'text' });

