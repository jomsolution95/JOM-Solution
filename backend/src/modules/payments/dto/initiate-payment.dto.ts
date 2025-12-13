import { IsEnum, IsNotEmpty, IsNumber, IsString, IsOptional, Min, IsMongoId } from 'class-validator';
import { PaymentProvider } from '../../services/schemas/transaction.schema';

export class InitiatePaymentDto {
    @IsMongoId()
    @IsNotEmpty()
    orderId: string;

    @IsEnum(PaymentProvider)
    @IsNotEmpty()
    provider: PaymentProvider;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string; // For Wave/OM prompt
}
