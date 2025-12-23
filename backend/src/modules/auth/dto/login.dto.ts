import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    role?: string;
}
