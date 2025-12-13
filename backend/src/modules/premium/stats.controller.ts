import {
    Controller,
    Get,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { StatsService } from './services/stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    /**
     * Get profile statistics (Individual users)
     */
    @Get('profile')
    async getProfileStats(@Request() req: any) {
        const stats = await this.statsService.getProfileStats(req.user.userId);
        return { stats };
    }

    /**
     * Get recruitment statistics (Companies)
     */
    @Get('recruitment')
    async getRecruitmentStats(@Request() req: any) {
        const stats = await this.statsService.getRecruitmentStats(req.user.userId);
        return { stats };
    }

    /**
     * Get academy statistics (Educational institutions)
     */
    @Get('academy')
    async getAcademyStats(@Request() req: any) {
        const stats = await this.statsService.getAcademyStats(req.user.userId);
        return { stats };
    }

    /**
     * Get user ranking in category
     */
    @Get('ranking')
    async getUserRanking(@Request() req: any, @Query('category') category: string) {
        const ranking = await this.statsService.getUserRanking(req.user.userId, category);
        return { ranking };
    }
}
