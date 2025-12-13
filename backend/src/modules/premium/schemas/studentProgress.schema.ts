import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentProgressDocument = StudentProgress & Document;

export interface ModuleProgress {
    moduleId: string;
    moduleName: string;
    completed: boolean;
    completedAt?: Date;
    progress: number; // 0-100
    timeSpent?: number; // in seconds
    lastAccessedAt?: Date;
    completedContent?: string[]; // IDs of completed content
}

export interface QuizAttempt {
    quizId: string;
    attemptDate: Date;
    score: number;
    maxScore: number;
    passed: boolean;
    timeSpent?: number;
    answers?: any[];
}

@Schema({ timestamps: true })
export class StudentProgress {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Training', required: true, index: true })
    courseId!: Types.ObjectId;

    @Prop({ required: true, default: 0, min: 0, max: 100 })
    progress!: number;

    @Prop({ default: false })
    completed!: boolean;

    @Prop()
    completedAt?: Date;

    @Prop()
    enrolledAt!: Date;

    @Prop()
    lastAccessedAt?: Date;

    @Prop({ type: [Object], default: [] })
    moduleProgress!: ModuleProgress[];

    @Prop({ type: [Object], default: [] })
    quizAttempts!: QuizAttempt[];

    @Prop({ default: 0 })
    totalTimeSpent!: number; // in seconds

    @Prop()
    certificateId?: Types.ObjectId;

    @Prop({ default: false })
    certificateIssued!: boolean;

    @Prop({ type: Object })
    metadata?: {
        currentModuleId?: string;
        lastContentId?: string;
        notes?: string;
        bookmarks?: string[];
    };
}

export const StudentProgressSchema = SchemaFactory.createForClass(StudentProgress);

// Indexes
StudentProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
StudentProgressSchema.index({ courseId: 1, progress: -1 });
StudentProgressSchema.index({ completed: 1, completedAt: -1 });

// Methods
StudentProgressSchema.methods.updateProgress = async function (): Promise<void> {
    if (this.moduleProgress.length === 0) {
        this.progress = 0;
        return;
    }

    const totalModules = this.moduleProgress.length;
    const completedModules = this.moduleProgress.filter((m: ModuleProgress) => m.completed).length;
    this.progress = Math.round((completedModules / totalModules) * 100);

    if (this.progress === 100 && !this.completed) {
        this.completed = true;
        this.completedAt = new Date();
    }

    await this.save();
};

StudentProgressSchema.methods.completeModule = async function (moduleId: string): Promise<void> {
    const moduleIndex = this.moduleProgress.findIndex((m: ModuleProgress) => m.moduleId === moduleId);
    if (moduleIndex !== -1) {
        this.moduleProgress[moduleIndex].completed = true;
        this.moduleProgress[moduleIndex].completedAt = new Date();
        this.moduleProgress[moduleIndex].progress = 100;
        await this.updateProgress();
    }
};
