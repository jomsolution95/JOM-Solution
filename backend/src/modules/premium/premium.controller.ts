import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { PremiumService } from './premium.service';
import { SubscriptionService } from './services/subscription.service';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { SubscriptionPlan } from './schemas/subscription.schema';
import { QuotaType } from './schemas/premiumQuotas.schema';

@Controller('premium')
@UseGuards(AccessTokenGuard)
export class PremiumController {
    constructor(private readonly premiumService: PremiumService) { }

    /**
     * Check if user has active subscription
     */
    @Get('status')
    async getSubscriptionStatus(@Request() req: any) {
        const hasActive = await this.premiumService.hasActiveSubscription(req.user.userId);
        const subscription = hasActive
            ? await this.premiumService.getActiveSubscription(req.user.userId)
            : null;

        return {
            isPremium: hasActive,
            subscription,
        };
    }

    /**
     * Get active subscription details
     */
    @Get('subscription')
    async getSubscription(@Request() req: any) {
        const subscription = await this.premiumService.getActiveSubscription(req.user.userId);
        return { subscription };
    }

    /**
     * Get user quotas
     */
    @Get('quotas')
    async getUserQuotas(@Request() req: any) {
        const quotas = await this.premiumService.getUserQuotas(req.user.userId);
        return { quotas };
    }

    /**
     * Get remaining quota for specific type
     */
    @Get('quotas/:type')
    async getRemainingQuota(@Request() req: any, @Param('type') type: QuotaType) {
        const remaining = await this.premiumService.getRemainingQuota(req.user.userId, type);
        const hasAvailable = await this.premiumService.hasQuotaAvailable(req.user.userId, type);

        return {
            quotaType: type,
            remaining,
            hasAvailable,
        };
    }

    /**
     * Check if user can perform action
     */
    @Post('check-access')
    async checkAccess(
        @Request() req: any,
        @Body() body: { plan: SubscriptionPlan | SubscriptionPlan[]; quotaType?: QuotaType },
    ) {
        const result = await this.premiumService.canPerformAction(
            req.user.userId,
            body.plan,
            body.quotaType,
        );

        return result;
    }

    /**
     * Verify if user has required plan
     */
    @Post('verify-plan')
    async verifyPlan(@Request() req: any, @Body() body: { plan: SubscriptionPlan | SubscriptionPlan[] }) {
        const hasPlan = await this.premiumService.verifyPlan(req.user.userId, body.plan);
        return { hasPlan };
    }

    /**
     * Get active boosts for a target
     */
    @Get('boosts/:targetId')
    async getActiveBoosts(@Param('targetId') targetId: string) {
        const boosts = await this.premiumService.getActiveBoosts(targetId);
        return { boosts };
    }

    /**
     * Check if target has active boost
     */
    @Get('boosts/:targetId/check')
    async checkActiveBoost(
        @Param('targetId') targetId: string,
        @Query('type') boostType?: string,
    ) {
        const hasBoost = await this.premiumService.hasActiveBoost(targetId, boostType);
        return { hasBoost };
    }
    /**
     * Buy Subscription
     */
    @Post('sub/buy')
    async buySubscription(@Request() req: any, @Body() body: any) {
        return this.premiumService.buySubscription(req.user.userId, body);
    }
}
