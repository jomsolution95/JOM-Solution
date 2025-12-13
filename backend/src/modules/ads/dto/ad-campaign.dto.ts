import { IsString, IsEnum, IsArray, IsOptional, IsNumber, IsDateString, IsUrl, IsObject, Min, Max } from 'class-validator';
import { AdPlacement, CampaignStatus } from '../schemas/adCampaign.schema';

export class CreateCampaignDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsUrl()
    imageUrl!: string;

    @IsUrl()
    targetUrl!: string;

    @IsString()
    headline!: string;

    @IsOptional()
    @IsString()
    bodyText?: string;

    @IsArray()
    @IsEnum(AdPlacement, { each: true })
    placements!: AdPlacement[];

    @IsOptional()
    @IsObject()
    targeting?: {
        cities?: string[];
        sectors?: string[];
        ageMin?: number;
        ageMax?: number;
        gender?: string;
        interests?: string[];
    };

    @IsNumber()
    @Min(10000)
    budget!: number;

    @IsOptional()
    @IsNumber()
    @Min(500)
    cpmRate?: number;

    @IsDateString()
    startDate!: string;

    @IsDateString()
    endDate!: string;
}

export class UpdateCampaignDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(CampaignStatus)
    status?: CampaignStatus;

    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsOptional()
    @IsUrl()
    targetUrl?: string;

    @IsOptional()
    @IsObject()
    targeting?: any;

    @IsOptional()
    @IsNumber()
    budget?: number;
}

export class LogImpressionDto {
    @IsString()
    campaignId!: string;

    @IsString()
    placement!: string;

    @IsOptional()
    @IsObject()
    userContext?: any;
}
