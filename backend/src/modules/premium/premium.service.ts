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
        @InjectModel(Subscription.name)
        private subscriptionModel: Model<SubscriptionDocument>,
        @InjectModel(PremiumQuota.name)
        private quotaModel: Model<PremiumQuotaDocument>,
        @InjectModel(Boost.name)
        private boostModel: Model<BoostDocument>,
    ) { }

    /**
     * Check if user has an active subscription
     */
    async hasActiveSubscription(userId: string | Types.ObjectId): Promise<boolean> {
        const subscription = await this.subscriptionModel.findOne({
            userId: new Types.ObjectId(userId),
            status: SubscriptionStatus.ACTIVE,
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
            status: SubscriptionStatus.ACTIVE,
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
        if (!subscription) return false;

        const plans = Array.isArray(requiredPlan) ? requiredPlan : [requiredPlan];
        return plans.includes(subscription.plan);
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
