import { IsEmail, IsEnum, IsOptional, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../schemas/user.schema';

export class SocialLinksDto {
    @IsOptional()
    @IsUrl()
    linkedin?: string;

    @IsOptional()
    @IsUrl()
    github?: string;

    @IsOptional()
    @IsUrl()
    twitter?: string;

    @IsOptional()
    @IsUrl()
    website?: string;
}

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsOptional()
    password?: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsOptional()
    @ValidateNested()
    @Type(() => SocialLinksDto)
    socialLinks?: SocialLinksDto;
}
