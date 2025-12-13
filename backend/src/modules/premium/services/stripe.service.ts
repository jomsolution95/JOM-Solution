import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (apiKey) {
            this.stripe = new Stripe(apiKey, {
                apiVersion: '2025-01-27.acacia' as any,
            });
        }
    }

    /**
     * Create a payment intent for subscription
     */
    async createPaymentIntent(
        amount: number,
        currency: string = 'xof',
        metadata?: Record<string, any>,
    ): Promise<Stripe.PaymentIntent> {
        try {
            return await this.stripe.paymentIntents.create({
                amount: Math.round(amount), // Amount in smallest currency unit
                currency: currency.toLowerCase(),
                metadata: metadata || {},
                automatic_payment_methods: {
                    enabled: true,
                },
            });
        } catch (error: any) {
            throw new BadRequestException(`Stripe payment failed: ${error.message}`);
        }
    }

    /**
     * Verify payment intent status
     */
    async verifyPayment(paymentIntentId: string): Promise<boolean> {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent.status === 'succeeded';
        } catch (error: any) {
            throw new BadRequestException(`Payment verification failed: ${error.message}`);
        }
    }

    /**
     * Create a customer
     */
    async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
        return await this.stripe.customers.create({
            email,
            name,
        });
    }

    /**
     * Create a subscription (for recurring payments)
     */
    async createSubscription(
        customerId: string,
        priceId: string,
    ): Promise<Stripe.Subscription> {
        return await this.stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
        });
    }

    /**
     * Cancel a subscription
     */
    async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
        return await this.stripe.subscriptions.cancel(subscriptionId);
    }
}
