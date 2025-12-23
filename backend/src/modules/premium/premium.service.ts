import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    Subscription,
    SubscriptionDocument,
    SubscriptionPlan,
    SubscriptionStatus,
} from './schemas/subscription.schema';
import {
    PremiumQuota,
    PremiumQuotaDocument,
    QuotaType,
} from './schemas/premiumQuotas.schema';
import { Boost, BoostDocument } from './schemas/boosts.schema';
import { Transaction, TransactionDocument, TransactionType, TransactionStatus, PaymentProvider } from '../services/schemas/transaction.schema';
import { User } from '../users/schemas/user.schema';

export interface QuotaLimits {
    cvViews?: number;
    jobPosts?: number;
    courseUploads?: number;
    studentSlots?: number;
    boosts?: number;
}

const PLAN_QUOTAS: Record<SubscriptionPlan, QuotaLimits> = {
    [SubscriptionPlan.INDIVIDUAL_PRO]: {
        cvViews: 0, // Not applicable
        jobPosts: 0, // Not applicable
        courseUploads: 0, // Not applicable
        studentSlots: 0, // Not applicable
        boosts: 3, // 3 boosts per month
    },
    [SubscriptionPlan.COMPANY_BIZ]: {
        cvViews: 50,
        jobPosts: 10,
        courseUploads: 0,
        studentSlots: 0,
        boosts: 5,
    },
    [SubscriptionPlan.SCHOOL_EDU]: {
        cvViews: 0,
        jobPosts: 0,
        courseUploads: -1, // Unlimited
        studentSlots: -1, // Unlimited
        boosts: 3,
    },
};

@Injectable()
export class PremiumService {
    constructor(
        @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
        @InjectModel(PremiumQuota.name) private quotaModel: Model<PremiumQuotaDocument>,
        @InjectModel(Boost.name) private boostModel: Model<BoostDocument>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    ) { }

    async buySubscription(
        userId: string,
        dto: {
            plan: string;
            paymentMethod: string;
            amount: number;
            phoneNumber?: string;
            billingCycle: string
        }
    ) {
        // 1. Create Pending Transaction
        const transaction = new this.transactionModel({
            user: userId,
            payer: userId,
            amount: dto.amount,
            currency: 'XOF',
            type: TransactionType.SUBSCRIPTION,
            status: TransactionStatus.PENDING,
            provider: dto.paymentMethod.toUpperCase(),
            description: `Subscription: ${dto.plan} (${dto.billingCycle})`,
            metadata: {
                planId: dto.plan,
                billingCycle: dto.billingCycle,
                phoneNumber: dto.phoneNumber
            }
        });

        await transaction.save();

        // 2. MOCK PAYMENT SUCCESS (For Now)
        // In real prod, we would call PayTech/Stripe here and return a paymentUrl

        await this.handleSubscriptionSuccess(transaction);

        return {
            status: 'success',
            message: 'Abonnement activé avec succès',
            transactionId: transaction._id
        };
    }

    private async handleSubscriptionSuccess(transaction: TransactionDocument) {
        transaction.status = TransactionStatus.COMPLETED;
        transaction.externalId = `MOCK-SUB-${Date.now()}`;
        await transaction.save();

        const planId = transaction.metadata?.planId;
        const billingCycle = transaction.metadata?.billingCycle;

        if (!planId) return;

        // Calculate end date
        const endDate = new Date();
        if (billingCycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // Upsert Subscription
        await this.subscriptionModel.findOneAndUpdate(
            { userId: transaction.user }, // Changed 'user' to 'userId' to match schema
            {
                plan: planId, // Assuming planId maps to SubscriptionPlan enum or similar
                status: SubscriptionStatus.ACTIVE, // Use enum
                startDate: new Date(),
                endDate: endDate,
                autoRenew: true,
                transactions: [transaction._id]
            },
            { upsert: true, new: true }
        );

        // Reset/Update Quotas based on Plan (Simplified logic)
        // In a real app, we'd look up plan details to get limits
        await this.resetQuotasForPlan(transaction.user.toString(), planId);
    }

    private async resetQuotasForPlan(userId: string, planId: string) {
        // Mock quotas for now
        const quotas = [
            { type: QuotaType.JOB_POSTS, limit: planId.includes('company') ? 10 : 0 }, // Changed to JOB_POSTS
            { type: QuotaType.CV_VIEWS, limit: planId.includes('company') ? 50 : 0 }, // Changed to CV_VIEWS
            { type: QuotaType.PROFILE_BOOSTS, limit: 3 }, // Added PROFILE_BOOSTS, default
        ];

        for (const q of quotas) {
            // Determine periodEnd for the quota
            const now = new Date();
            const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of month

            await this.quotaModel.findOneAndUpdate(
                { userId: userId, quotaType: q.type }, // Changed 'user' to 'userId', 'type' to 'quotaType'
                {
                    userId: new Types.ObjectId(userId), // Ensure userId is ObjectId
                    quotaType: q.type,
                    limit: q.limit === -1 ? 999999 : q.limit, // Handle unlimited
                    unlimited: q.limit === -1,
                    used: 0,
                    periodStart: now,
                    periodEnd: periodEnd,
                },
                { upsert: true, new: true }
            );
        }
    }

    /**
     * Check if user has an active subscription
     */
    async hasActiveSubscription(userId: string | Types.ObjectId): Promise<boolean> {
        const subscription = await this.subscriptionModel.findOne({
            userId: new Types.ObjectId(userId),
            status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
            endDate: { $gte: new Date() },
        });

        return !!subscription;
    }

    /**
     * Get user's active subscription
     */
    async getActiveSubscription(
        userId: string | Types.ObjectId,
    ): Promise<SubscriptionDocument | null> {
        return this.subscriptionModel.findOne({
            userId: new Types.ObjectId(userId),
            status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
            endDate: { $gte: new Date() },
        });
    }

    /**
     * Verify if user has required plan
     */
    async verifyPlan(
        userId: string | Types.ObjectId,
        requiredPlan: SubscriptionPlan | SubscriptionPlan[],
    ): Promise<boolean> {
        const subscription = await this.getActiveSubscription(userId);
        console.log(`[VerifyPlan] User: ${userId}, Sub: ${subscription?.plan}, Status: ${subscription?.status}, Required: ${requiredPlan}`);
        if (!subscription) {
            console.log('[VerifyPlan] No active subscription found.');
            return false;
        }

        const plans = Array.isArray(requiredPlan) ? requiredPlan : [requiredPlan];
        const allowed = plans.includes(subscription.plan);
        console.log(`[VerifyPlan] Allowed: ${allowed}`);
        return allowed;
    }

    /**
     * Check if user has quota available for a specific type
     */
    async hasQuotaAvailable(
        userId: string | Types.ObjectId,
        quotaType: QuotaType,
    ): Promise<boolean> {
        const quota = await this.quotaModel.findOne({
            userId: new Types.ObjectId(userId),
            quotaType,
            periodEnd: { $gte: new Date() },
        });

        if (!quota) {
            // No quota found, check if user has premium
            const hasPremium = await this.hasActiveSubscription(userId);
            return !hasPremium; // If no premium, allow (freemium), if premium but no quota, deny
        }

        return quota.hasQuotaAvailable();
    }

    /**
     * Get remaining quota for a specific type
     */
    async getRemainingQuota(
        userId: string | Types.ObjectId,
        quotaType: QuotaType,
    ): Promise<number> {
        const quota = await this.quotaModel.findOne({
            userId: new Types.ObjectId(userId),
            quotaType,
            periodEnd: { $gte: new Date() },
        });

        if (!quota) return 0;
        return quota.getRemainingQuota();
    }

    /**
     * Increment quota usage
     */
    async incrementQuota(
        userId: string | Types.ObjectId,
        quotaType: QuotaType,
        amount: number = 1,
    ): Promise<void> {
        const quota = await this.quotaModel.findOne({
            userId: new Types.ObjectId(userId),
            quotaType,
            periodEnd: { $gte: new Date() },
        });

        if (!quota) {
            throw new NotFoundException('Quota not found');
        }

        if (!quota.hasQuotaAvailable()) {
            throw new ForbiddenException('Quota limit exceeded');
        }

        await quota.incrementUsage(amount);
    }

    /**
     * Initialize quotas for a new subscription
     */
    async initializeQuotas(
        userId: string | Types.ObjectId,
        plan: SubscriptionPlan,
    ): Promise<void> {
        const limits = PLAN_QUOTAS[plan];
        const now = new Date();
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of month

        const quotaTypes: QuotaType[] = [
            QuotaType.CV_VIEWS,
            QuotaType.JOB_POSTS,
            QuotaType.COURSE_UPLOADS,
            QuotaType.STUDENT_SLOTS,
            QuotaType.PROFILE_BOOSTS,
        ];

        for (const quotaType of quotaTypes) {
            const limit = this.getQuotaLimit(limits, quotaType);
            if (limit === 0) continue; // Skip if not applicable

            await this.quotaModel.findOneAndUpdate(
                { userId: new Types.ObjectId(userId), quotaType },
                {
                    userId: new Types.ObjectId(userId),
                    quotaType,
                    used: 0,
                    limit: limit === -1 ? 999999 : limit,
                    unlimited: limit === -1,
                    periodStart: now,
                    periodEnd,
                },
                { upsert: true, new: true },
            );
        }
    }

    /**
     * Reset monthly quotas
     */
    async resetMonthlyQuotas(userId: string | Types.ObjectId): Promise<void> {
        const now = new Date();
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        await this.quotaModel.updateMany(
            {
                userId: new Types.ObjectId(userId),
                periodEnd: { $lt: now },
            },
            {
                $set: {
                    used: 0,
                    periodStart: now,
                    periodEnd,
                },
            },
        );
    }

    /**
     * Get all quotas for a user
     */
    async getUserQuotas(userId: string | Types.ObjectId): Promise<any> {
        const quotas = await this.quotaModel.find({
            userId: new Types.ObjectId(userId),
            periodEnd: { $gte: new Date() },
        });

        return quotas.reduce((acc, quota) => {
            acc[quota.quotaType] = {
                used: quota.used,
                limit: quota.unlimited ? 'unlimited' : quota.limit,
                remaining: quota.getRemainingQuota(),
                periodEnd: quota.periodEnd,
            };
            return acc;
        }, {} as Record<string, any>);
    }

    /**
     * Check if user can perform action (combines subscription + quota check)
     */
    async canPerformAction(
        userId: string | Types.ObjectId,
        requiredPlan: SubscriptionPlan | SubscriptionPlan[],
        quotaType?: QuotaType,
    ): Promise<{ allowed: boolean; reason?: string }> {
        // Check subscription
        const hasPlan = await this.verifyPlan(userId, requiredPlan);
        if (!hasPlan) {
            return { allowed: false, reason: 'Premium subscription required' };
        }

        // Check quota if specified
        if (quotaType) {
            const hasQuota = await this.hasQuotaAvailable(userId, quotaType);
            if (!hasQuota) {
                return { allowed: false, reason: 'Quota limit exceeded' };
            }
        }

        return { allowed: true };
    }

    /**
     * Get active boosts for a target
     */
    async getActiveBoosts(targetId: string | Types.ObjectId): Promise<BoostDocument[]> {
        const now = new Date();
        return this.boostModel.find({
            targetId: new Types.ObjectId(targetId),
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now },
        });
    }

    /**
     * Check if target has active boost
     */
    async hasActiveBoost(
        targetId: string | Types.ObjectId,
        boostType?: string,
    ): Promise<boolean> {
        const query: any = {
            targetId: new Types.ObjectId(targetId),
            status: 'active',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
        };

        if (boostType) {
            query.type = boostType;
        }

        const count = await this.boostModel.countDocuments(query);
        return count > 0;
    }

    /**
     * Expire old boosts
     */
    async expireOldBoosts(): Promise<void> {
        await this.boostModel.updateMany(
            {
                status: 'active',
                endDate: { $lt: new Date() },
            },
            {
                $set: { status: 'expired' },
            },
        );
    }

    /**
     * Check and enforce usage limits for freemium users.
     * If user is Premium -> Bypasses limit (Unlimited).
     * If user is Free -> Enforces 'limit'.
     */
    async checkFreeLimit(userId: string, type: QuotaType, limit: number): Promise<void> {
        const hasPremium = await this.hasActiveSubscription(userId);
        if (hasPremium) return; // Unlimited for Premium

        const now = new Date();
        // Check existing quota for current month
        let quota = await this.quotaModel.findOne({
            userId: new Types.ObjectId(userId),
            quotaType: type,
            periodEnd: { $gte: now }
        });

        if (!quota) {
            // Init quota for this month
            const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            quota = new this.quotaModel({
                userId: new Types.ObjectId(userId),
                quotaType: type,
                limit: limit,
                used: 0,
                periodStart: now,
                periodEnd: periodEnd,
                unlimited: false
            });
            await quota.save();
        }

        if (quota.used >= quota.limit) {
            throw new ForbiddenException(`Free limit reached for ${type} (${quota.limit}/month). Upgrade to Premium for unlimited access.`);
        }

        quota.used += 1;
        await quota.save();
    }

    /**
     * Helper to get quota limit from plan limits
     */
    private getQuotaLimit(limits: QuotaLimits, quotaType: QuotaType): number {
        switch (quotaType) {
            case QuotaType.CV_VIEWS:
                return limits.cvViews || 0;
            case QuotaType.JOB_POSTS:
                return limits.jobPosts || 0;
            case QuotaType.COURSE_UPLOADS:
                return limits.courseUploads || 0;
            case QuotaType.STUDENT_SLOTS:
                return limits.studentSlots || 0;
            case QuotaType.PROFILE_BOOSTS:
            case QuotaType.JOB_BOOSTS:
            case QuotaType.TRAINING_BOOSTS:
                return limits.boosts || 0;
            default:
                return 0;
        }
    }
}
