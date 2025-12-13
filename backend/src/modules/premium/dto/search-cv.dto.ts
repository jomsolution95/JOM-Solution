import { IsOptional, IsString, IsNumber, IsArray, Min, Max } from 'class-validator';

export class SearchCVDto {
    @IsOptional()
    @IsString()
    skills?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minExperience?: number;

    @IsOptional()
    @IsNumber()
    @Max(50)
    maxExperience?: number;

    @IsOptional()
    @IsString()
    education?: string;

    @IsOptional()
    @IsString()
    availability?: string;

    @IsOptional()
    @IsArray()
    languages?: string[];

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(50)
    limit?: number;
}

export class AddFavoriteDto {
    @IsString()
    profileId!: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateNotesDto {
    @IsString()
    notes!: string;
}
