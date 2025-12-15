import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TrainingContent } from './trainingContent.schema';

export type TrainingDocument = Training & Document;

export interface CourseModule {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    order: number;
    content: TrainingContent[];
    duration?: number;
}

@Schema({ timestamps: true })
export class Training {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    institutionId!: Types.ObjectId;

    @Prop({ required: true })
    title!: string;

    @Prop()
    description!: string;

    @Prop()
    thumbnailUrl?: string;

    @Prop()
    previewVideoUrl?: string;

    @Prop({ type: String, enum: ['course', 'webinar', 'workshop'], default: 'course' })
    type!: string;

    @Prop({ default: false })
    published!: boolean;

    @Prop({ type: [Object], default: [] })
    modules!: CourseModule[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    enrolledStudents!: Types.ObjectId[];

    @Prop({ default: 0 })
    price?: number;

    @Prop({ default: 'XOF' })
    currency?: string;

    @Prop()
    category?: string;

    @Prop()
    level?: string; // beginner, intermediate, advanced

    @Prop({ default: 0 })
    duration?: number; // Total duration in hours or seconds

    @Prop({ type: Object })
    metadata?: any;

    @Prop({ default: false })
    isFeatured?: boolean;

    @Prop()
    featuredExpiresAt?: Date;
}

export const TrainingSchema = SchemaFactory.createForClass(Training);

// Indexes
TrainingSchema.index({ institutionId: 1 });
TrainingSchema.index({ published: 1 });
