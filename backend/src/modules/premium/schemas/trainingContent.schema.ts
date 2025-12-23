import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TrainingContentDocument = TrainingContent & Document;

export enum ContentType {
    VIDEO = 'video',
    PDF = 'pdf',
    QUIZ = 'quiz',
    DOCUMENT = 'document',
    AUDIO = 'audio',
    INTERACTIVE = 'interactive',
    LIVE_SESSION = 'live_session',
}

export enum ContentStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    points?: number;
}

@Schema({ timestamps: true })
export class TrainingContent {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    institutionId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Training', required: true, index: true })
    courseId!: Types.ObjectId;

    @Prop()
    moduleId?: string;

    @Prop({ required: true })
    title!: string;

    @Prop()
    description?: string;

    @Prop({ required: true, enum: Object.values(ContentType) })
    type!: ContentType;

    @Prop({ required: true })
    url!: string;

    @Prop()
    thumbnailUrl?: string;

    @Prop({ default: 0 })
    duration?: number; // in seconds

    @Prop({ default: 0 })
    order!: number;

    @Prop({ required: true, enum: Object.values(ContentStatus), default: ContentStatus.DRAFT })
    status!: ContentStatus;

    @Prop({ default: 0 })
    fileSize?: number; // in bytes

    @Prop()
    mimeType?: string;

    @Prop({ type: [Object] })
    quizQuestions?: QuizQuestion[];

    @Prop({ type: Object })
    metadata?: {
        resolution?: string;
        format?: string;
        language?: string;
        subtitles?: string[];
        downloadable?: boolean;
        previewAvailable?: boolean;
        requiredScore?: number;
        passingScore?: number;
    };

    @Prop({ default: false })
    isFree!: boolean;

    @Prop({ default: false })
    isPreview!: boolean;
}

export const TrainingContentSchema = SchemaFactory.createForClass(TrainingContent);

// Indexes

TrainingContentSchema.index({ courseId: 1, order: 1 });

TrainingContentSchema.index({ type: 1 });
