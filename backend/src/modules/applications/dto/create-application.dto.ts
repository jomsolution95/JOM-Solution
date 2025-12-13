import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateApplicationDto {
    @IsString()
    @IsNotEmpty()
    jobId: string;

    @IsString()
    @IsNotEmpty()
    coverLetter: string;

    @IsOptional()
    @IsArray()
    attachments?: string[];
}
