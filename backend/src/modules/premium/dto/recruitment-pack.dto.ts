import { IsEnum, IsString, IsOptional, IsNumber } from 'class-validator';
import { PackSize } from '../schemas/recruitmentPack.schema';

export class PurchasePackDto {
    @IsEnum(PackSize)
    packSize!: PackSize;

    @IsString()
    paymentMethod!: string;

    @IsOptional()
    @IsString()
    paymentToken?: string;



    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsString()
    currency?: string;
}

export class ConsumePackDto {
    @IsString()
    jobId!: string;
}
