import { IsString, IsEnum, IsArray, IsOptional, IsNumber, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ContentType {
    VIDEO = 'video',
    PDF = 'pdf',
    QUIZ = 'quiz',
    TEXT = 'text',
    LIVE_SESSION = 'live_session',
}

export class QuizQuestionDto {
    @IsString()
    question!: string;

    @IsArray()
    @IsString({ each: true })
    options!: string[];

    @IsNumber()
    correctAnswer!: number;

    @IsOptional()
    @IsString()
    explanation?: string;
}

export class CreateCourseDto {
    @IsString()
    title!: string;

    @IsString()
    description!: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsOptional()
    @IsNumber()
    duration?: number;

    @IsOptional()
    @IsString()
    level?: string;
}

export class UpdateCourseDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsOptional()
    @IsBoolean()
    published?: boolean;
}

export class CreateModuleDto {
    @IsString()
    title!: string;

    @IsString()
    description!: string;

    @IsNumber()
    order!: number;
}

export class CreateContentDto {
    @IsString()
    title!: string;

    @IsEnum(ContentType)
    type!: ContentType;

    @IsOptional()
    @IsString()
    url?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuizQuestionDto)
    questions?: QuizQuestionDto[];

    @IsNumber()
    order!: number;

    @IsOptional()
    @IsNumber()
    duration?: number;
}

export class EnrollStudentDto {
    @IsString()
    studentId!: string;

    @IsString()
    courseId!: string;
}

export class UpdateProgressDto {
    @IsString()
    moduleId!: string;

    @IsOptional()
    @IsNumber()
    progress?: number;

    @IsOptional()
    @IsBoolean()
    completed?: boolean;
}

export class SubmitQuizDto {
    @IsString()
    contentId!: string;

    @IsArray()
    @IsNumber({}, { each: true })
    answers!: number[];
}
