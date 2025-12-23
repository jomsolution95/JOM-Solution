import { IsNotEmpty, IsOptional, IsString, IsArray, IsObject } from 'class-validator';

export class CreateProfileDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsObject()
    companyDetails?: {
        size?: string;
        website?: string;
        industry?: string;
    };

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsArray()
    skills?: string[];
}
