import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PremiumService } from '../premium.service';
import { SubscriptionPlan } from '../schemas/subscription.schema';
import { QuotaType } from '../schemas/premiumQuotas.schema';

export const PREMIUM_KEY = 'premium';
export const QUOTA_KEY = 'quota';

export interface PremiumOptions {
    plan: SubscriptionPlan | SubscriptionPlan[];
    quotaType?: QuotaType;
    autoIncrement?: boolean;
}

/**
 * Decorator to protect routes with premium subscription requirement
 * @param options Premium options (plan required, quota type, etc.)
 */
export const RequiresPremium = (options: PremiumOptions) => {
    return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
        if (propertyKey && descriptor) {
            Reflect.defineMetadata(PREMIUM_KEY, options, descriptor.value);
            return descriptor;
        }
        Reflect.defineMetadata(PREMIUM_KEY, options, target);
        return target;
    };
};

/**
 * Guard to check premium subscription and quotas
 */
@Injectable()
export class PremiumGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private premiumService: PremiumService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const premiumOptions = this.reflector.get<PremiumOptions>(
            PREMIUM_KEY,
            context.getHandler(),
        );

        if (!premiumOptions) {
            return true; // No premium requirement
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.userId) {
            throw new UnauthorizedException('User not authenticated');
        }

        // Check if user can perform action
        const result = await this.premiumService.canPerformAction(
            user.userId,
            premiumOptions.plan,
            premiumOptions.quotaType,
        );

        if (!result.allowed) {
            throw new ForbiddenException(result.reason || 'Premium subscription required');
        }

        // Auto-increment quota if specified
        if (premiumOptions.autoIncrement && premiumOptions.quotaType) {
            try {
                await this.premiumService.incrementQuota(user.userId, premiumOptions.quotaType);
            } catch (error) {
                throw new ForbiddenException('Quota limit exceeded');
            }
        }

        return true;
    }
}

/**
 * Simplified decorator for common use cases
 */
export const RequiresIndividualPro = () =>
    RequiresPremium({ plan: SubscriptionPlan.INDIVIDUAL_PRO });

export const RequiresCompanyBiz = () =>
    RequiresPremium({ plan: SubscriptionPlan.COMPANY_BIZ });

export const RequiresSchoolEdu = () =>
    RequiresPremium({ plan: SubscriptionPlan.SCHOOL_EDU });

/**
 * Decorator with quota check and auto-increment
 */
export const RequiresPremiumWithQuota = (
    plan: SubscriptionPlan | SubscriptionPlan[],
    quotaType: QuotaType,
    autoIncrement: boolean = true,
) => RequiresPremium({ plan, quotaType, autoIncrement });
