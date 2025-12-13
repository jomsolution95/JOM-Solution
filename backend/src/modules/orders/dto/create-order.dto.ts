import { IsNotEmpty, IsString, IsNumber, IsMongoId, Min, IsOptional, IsDateString } from 'class-validator';

export class CreateOrderDto {
    @IsMongoId()
    @IsNotEmpty()
    serviceId: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsOptional()
    @IsString()
    requirements?: string;

    @IsOptional()
    @IsDateString()
    deliveryDate?: Date;
}
