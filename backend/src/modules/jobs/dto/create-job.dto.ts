import { IsNotEmpty, IsString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { JobType } from '../schemas/job.schema';

export class CreateJobDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(JobType)
    type: JobType;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsOptional()
    @IsString()
    budget?: string;

    @IsOptional()
    @IsArray()
    requirements?: string[];

    @IsOptional()
    @IsBoolean()
    isRemote?: boolean;

    @IsOptional()
    @IsBoolean()
    autoBroadcast?: boolean;
}
