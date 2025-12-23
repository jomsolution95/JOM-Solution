import { IsEmail, IsEnum, IsNotEmpty, MinLength, IsOptional, IsObject } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';
import { CreateProfileDto } from '../../profiles/dto/create-profile.dto';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsEnum(UserRole)
    role: UserRole;

    @IsOptional()
    @IsObject()
    profile?: CreateProfileDto;
}
