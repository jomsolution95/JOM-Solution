import { IsNotEmpty, IsString, IsNumber, IsMongoId, Min, IsEnum } from 'class-validator';
import { TransactionType } from '../../services/schemas/transaction.schema';

export class CreatePaymentDto {
    @IsMongoId()
    @IsNotEmpty()
    orderId: string;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsEnum(TransactionType)
    type: TransactionType;

    @IsString()
    @IsNotEmpty()
    paymentMethodId: string; // e.g., Stripe ID
}
