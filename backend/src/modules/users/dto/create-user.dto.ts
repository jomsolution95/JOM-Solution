import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsOptional()
    password?: string;

    @IsEnum(UserRole)
    role: UserRole;
}
