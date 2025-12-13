import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { BoostService } from './services/boost.service';
import { CreateBoostDto } from './dto/create-boost.dto';
import { BoostType } from './schemas/boosts.schema';

@Controller('boosts')
@UseGuards(AccessTokenGuard)
export class BoostController {
    constructor(private readonly boostService: BoostService) { }

    /**
     * Create a boost
     */
    @Post()
    async createBoost(@Request() req: any, @Body() dto: CreateBoostDto) {
        const result = await this.boostService.createBoost(req.user.userId, dto);
        return result;
    }

    /**
     * Get user's boosts
     */
    @Get('my-boosts')
    async getMyBoosts(@Request() req: any) {
        const boosts = await this.boostService.getUserBoosts(req.user.userId);
        return { boosts };
    }

    /**
     * Get active boosts for a target
     */
    @Get('target/:targetId')
    async getTargetBoosts(@Param('targetId') targetId: string) {
        const boosts = await this.boostService.getActiveBoosts(targetId);
        return { boosts };
    }

    /**
     * Check if target has active boost
     */
    @Get('check/:targetId')
    async checkBoost(
        @Param('targetId') targetId: string,
        @Query('type') type?: BoostType,
    ) {
        const hasBoost = await this.boostService.hasActiveBoost(targetId, type);
        return { hasBoost };
    }

    /**
     * Activate boost (after payment)
     */
    @Post(':boostId/activate')
    async activateBoost(@Param('boostId') boostId: string) {
        const boost = await this.boostService.activateBoost(boostId);
        return { boost, activated: true };
    }

    /**
     * Cancel boost
     */
    @Delete(':boostId')
    async cancelBoost(@Param('boostId') boostId: string, @Request() req: any) {
        const boost = await this.boostService.cancelBoost(boostId);
        return { boost, cancelled: true };
    }

    /**
     * Increment boost analytics
     */
    @Post(':boostId/analytics/:metric')
    async incrementAnalytics(
        @Param('boostId') boostId: string,
        @Param('metric') metric: 'views' | 'clicks' | 'applications' | 'conversions',
    ) {
        await this.boostService.incrementAnalytics(boostId, metric);
        return { success: true };
    }
}
