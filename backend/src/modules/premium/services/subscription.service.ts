import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument, SubscriptionPlan, SubscriptionStatus } from '../schemas/subscription.schema';
import { PremiumService } from '../premium.service';
import { StripeService } from './stripe.service';
import { WaveService } from './wave.service';
import { OrangeMoneyService } from './orange-money.service';
import { BuySubscriptionDto, PaymentMethod } from '../dto/buy-subscription.dto';
import { ConfigService } from '@nestjs/config';

const PLAN_PRICES = {
    [SubscriptionPlan.INDIVIDUAL_PRO]: 4900,
    [SubscriptionPlan.COMPANY_BIZ]: 29900,
    [SubscriptionPlan.SCHOOL_EDU]: 49900,
};

@Injectable()
export class SubscriptionService {
    constructor(
        @InjectModel(Subscription.name)
        private subscriptionModel: Model<SubscriptionDocument>,
        private premiumService: PremiumService,
        private stripeService: StripeService,
        private waveService: WaveService,
        private orangeMoneyService: OrangeMoneyService,
        private configService: ConfigService,
    ) { }

    /**
     * Buy a premium subscription
     */
    async buySubscription(
        userId: string | Types.ObjectId,
        dto: BuySubscriptionDto,
    ): Promise<{
        subscription?: SubscriptionDocument;
        paymentUrl?: string;
        transactionId?: string;
        clientSecret?: string;
    }> {
        let amount = dto.amount || PLAN_PRICES[dto.plan];
        const currency = dto.currency || 'XOF';
        const billingCycle = dto.billingCycle || 'monthly';

        // --- ANNUAL BILLING LOGIC ---
        if (billingCycle === 'yearly') {
            // Apply 20% Discount roughly by charging for 9.6 months instead of 12
            // Or strictly: (Monthly * 12) * 0.8
            // Let's use the strict 20% discount on the annualized price
            amount = (PLAN_PRICES[dto.plan] * 12) * 0.8;
            amount = Math.round(amount); // Ensure integer
        }
        // ----------------------------

        // Check if user already has active subscription
        const existingSubscription = await this.premiumService.getActiveSubscription(userId);
        if (existingSubscription) {
            throw new BadRequestException('User already has an active subscription');
        }

        let result: any = {};

        // Pass billingCycle to process modules
        const metadata = { billingCycle };

        switch (dto.paymentMethod) {
            case PaymentMethod.STRIPE:
                result = await this.processStripePayment(userId, dto.plan, amount, currency, dto.paymentToken, metadata);
                break;

            case PaymentMethod.WAVE:
                if (!dto.phoneNumber) {
                    throw new BadRequestException('Phone number required for Wave payment');
                }
                result = await this.processWavePayment(userId, dto.plan, amount, currency, dto.phoneNumber, metadata);
                break;

            case PaymentMethod.ORANGE_MONEY:
                if (!dto.phoneNumber) {
                    throw new BadRequestException('Phone number required for Orange Money payment');
                }
                result = await this.processOrangeMoneyPayment(userId, dto.plan, amount, currency, dto.phoneNumber, metadata);
                break;

            default:
                throw new BadRequestException('Invalid payment method');
        }

        return result;
    }

    /**
     * Process Stripe payment
     */
    private async processStripePayment(
        userId: string | Types.ObjectId,
        plan: SubscriptionPlan,
        amount: number,
        currency: string,
        paymentToken?: string,
        metadata?: any
    ): Promise<any> {
        const paymentIntent = await this.stripeService.createPaymentIntent(amount, currency, {
            userId: userId.toString(),
            plan,
            ...metadata
        });

        // Create pending subscription
        const subscription = await this.createSubscription(userId, plan, amount, currency, 'pending', {
            paymentIntentId: paymentIntent.id,
            paymentMethod: PaymentMethod.STRIPE,
            ...metadata
        });

        return {
            subscription,
            clientSecret: paymentIntent.client_secret,
            transactionId: paymentIntent.id,
        };
    }

    /**
     * Process Wave payment
     */
    private async processWavePayment(
        userId: string | Types.ObjectId,
        plan: SubscriptionPlan,
        amount: number,
        currency: string,
        phoneNumber: string,
        metadata?: any
    ): Promise<any> {
        const payment = await this.waveService.initiatePayment(amount, currency, phoneNumber, {
            userId: userId.toString(),
            plan,
            ...metadata
        });

        // Create pending subscription
        const subscription = await this.createSubscription(userId, plan, amount, currency, 'pending', {
            transactionId: payment.transactionId,
            paymentMethod: PaymentMethod.WAVE,
            ...metadata
        });

        return {
            subscription,
            paymentUrl: payment.checkoutUrl,
            transactionId: payment.transactionId,
        };
    }

    /**
     * Process Orange Money payment
     */
    private async processOrangeMoneyPayment(
        userId: string | Types.ObjectId,
        plan: SubscriptionPlan,
        amount: number,
        currency: string,
        phoneNumber: string,
        metadata?: any
    ): Promise<any> {
        const payment = await this.orangeMoneyService.initiatePayment(amount, currency, phoneNumber, {
            userId: userId.toString(),
            plan,
            ...metadata
        });

        // Create pending subscription
        const subscription = await this.createSubscription(userId, plan, amount, currency, 'pending', {
            transactionId: payment.transactionId,
            paymentMethod: PaymentMethod.ORANGE_MONEY,
            ...metadata
        });

        return {
            subscription,
            paymentUrl: payment.paymentUrl,
            transactionId: payment.transactionId,
        };
    }

    /**
     * Create subscription record
     */
    private async createSubscription(
        userId: string | Types.ObjectId,
        plan: SubscriptionPlan,
        amount: number,
        currency: string,
        status: string = 'pending',
        metadata?: any,
    ): Promise<SubscriptionDocument> {
        const now = new Date();
        const endDate = new Date(now);

        const billingCycle = metadata?.billingCycle || 'monthly';

        if (billingCycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1); // 1 year
        } else {
            endDate.setMonth(endDate.getMonth() + 1); // 1 month
        }

        const subscription = new this.subscriptionModel({
            userId: new Types.ObjectId(userId),
            plan,
            status,
            billingCycle,
            startDate: now,
            endDate,
            price: amount,
            currency,
            autoRenew: false,
            quotasUsed: {},
            paymentHistory: [
                {
                    date: now,
                    amount,
                    currency,
                    method: metadata?.paymentMethod || 'unknown',
                    transactionId: metadata?.transactionId || metadata?.paymentIntentId || '',
                    status: 'pending',
                },
            ],
        });

        return await subscription.save();
    }

    /**
     * Activate subscription after successful payment
     */
    async activateSubscription(subscriptionId: string | Types.ObjectId): Promise<SubscriptionDocument> {
        const subscription = await this.subscriptionModel.findById(subscriptionId);
        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        subscription.status = SubscriptionStatus.ACTIVE;

        // Update payment history
        if (subscription.paymentHistory.length > 0) {
            subscription.paymentHistory[subscription.paymentHistory.length - 1].status = 'success';
        }

        await subscription.save();

        // Initialize quotas
        await this.premiumService.initializeQuotas(subscription.userId, subscription.plan);

        // TODO: Send confirmation email

        return subscription;
    }

    /**
     * Verify payment and activate subscription
     */
    async verifyAndActivate(
        transactionId: string,
        paymentMethod: PaymentMethod,
    ): Promise<SubscriptionDocument> {
        let isVerified = false;

        switch (paymentMethod) {
            case PaymentMethod.STRIPE:
                isVerified = await this.stripeService.verifyPayment(transactionId);
                break;
            case PaymentMethod.WAVE:
                isVerified = await this.waveService.verifyPayment(transactionId);
                break;
            case PaymentMethod.ORANGE_MONEY:
                isVerified = await this.orangeMoneyService.verifyPayment(transactionId);
                break;
        }

        if (!isVerified) {
            throw new BadRequestException('Payment verification failed');
        }

        // Find subscription by transaction ID
        const subscription = await this.subscriptionModel.findOne({
            'paymentHistory.transactionId': transactionId,
        });

        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        return await this.activateSubscription(subscription._id);
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(userId: string | Types.ObjectId): Promise<SubscriptionDocument> {
        const subscription = await this.premiumService.getActiveSubscription(userId);
        if (!subscription) {
            throw new NotFoundException('No active subscription found');
        }

        subscription.status = SubscriptionStatus.CANCELLED;
        subscription.cancelledAt = new Date();
        subscription.autoRenew = false;

        return await subscription.save();
    }

    /**
     * Create a 30-day Free Trial Subscription
     */
    async createTrialSubscription(
        userId: string | Types.ObjectId,
        plan: SubscriptionPlan,
    ): Promise<SubscriptionDocument> {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 30); // 30 days trial

        const subscription = new this.subscriptionModel({
            userId: new Types.ObjectId(userId),
            plan,
            status: SubscriptionStatus.TRIAL,
            startDate: now,
            endDate,
            price: 0,
            currency: 'XOF', // Default
            autoRenew: false,
            quotasUsed: {},
            paymentHistory: [],
        });

        const savedSub = await subscription.save();

        // Initialize quotas immediately so they can use the trial
        await this.premiumService.initializeQuotas(userId, plan);

        return savedSub;
    }
}
