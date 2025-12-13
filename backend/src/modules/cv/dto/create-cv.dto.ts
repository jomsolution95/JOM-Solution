import { IsNotEmpty, IsString, IsObject, IsOptional, IsDateString } from 'class-validator';

export class CreateCvDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    templateId: string;

    @IsNotEmpty()
    @IsObject()
    content: Record<string, any>;

    @IsOptional()
    @IsDateString()
    lastExportDate?: string;
}
