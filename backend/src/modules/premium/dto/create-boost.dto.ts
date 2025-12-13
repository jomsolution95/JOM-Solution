import { IsEnum, IsString, IsNumber, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { BoostType } from '../schemas/boosts.schema';

export class CreateBoostDto {
    @IsEnum(BoostType)
    type!: BoostType;

    @IsString()
    targetId!: string;

    @IsOptional()
    @IsString()
    targetType?: string;

    @IsNumber()
    price!: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsNumber()
    duration?: number; // in days

    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;
}

export class UpdateBoostDto {
    @IsOptional()
    @IsEnum(['active', 'expired', 'cancelled', 'pending'])
    status?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endDate?: Date;
}
