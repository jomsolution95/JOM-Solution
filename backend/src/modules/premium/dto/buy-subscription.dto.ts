import { IsEnum, IsString, IsOptional, IsNumber } from 'class-validator';
import { SubscriptionPlan } from '../schemas/subscription.schema';

export enum PaymentMethod {
    STRIPE = 'stripe',
    WAVE = 'wave',
    ORANGE_MONEY = 'orange_money',
}

export class BuySubscriptionDto {
    @IsEnum(SubscriptionPlan)
    plan!: SubscriptionPlan;

    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod;

    @IsOptional()
    @IsString()
    paymentToken?: string; // For Stripe

    @IsOptional()
    @IsString()
    phoneNumber?: string; // For Wave/Orange Money

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsString()
    currency?: string;
}

export class VerifyPaymentDto {
    @IsString()
    transactionId!: string;

    @IsEnum(PaymentMethod)
    paymentMethod!: PaymentMethod;
}
