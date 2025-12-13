import { IsArray, IsOptional, IsString } from 'class-validator';

export class GenerateSummaryDto {
    @IsOptional()
    @IsArray()
    experiences?: any[];

    @IsOptional()
    @IsArray()
    skills?: any[];

    @IsOptional()
    @IsString()
    currentRole?: string;
}
