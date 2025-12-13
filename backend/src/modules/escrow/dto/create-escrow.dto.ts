import { IsNotEmpty, IsNumber, IsMongoId, Min } from 'class-validator';

export class CreateEscrowDto {
    @IsMongoId()
    @IsNotEmpty()
    orderId: string;

    @IsNumber()
    @Min(0)
    amount: number;
}
