import { IsArray, IsOptional, IsString } from 'class-validator';

export class AnalyzeCvDto {
    @IsOptional()
    @IsString()
    jobTitle?: string;

    @IsString() // Should ideally be nested object validation, but strictness varies
    cvContent: string; // JSON string or text content

    @IsArray()
    @IsOptional()
    skills?: string[];
}
