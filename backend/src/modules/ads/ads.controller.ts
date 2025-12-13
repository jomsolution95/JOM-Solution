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
    Ip,
    Headers,
} from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { AdsService } from './ads.service';
import { CreateCampaignDto, UpdateCampaignDto, LogImpressionDto } from './dto/ad-campaign.dto';

@Controller('ads')
export class AdsController {
    constructor(private readonly adsService: AdsService) { }

    /**
     * Create campaign
     */
    @Post('campaigns')
    @UseGuards(AccessTokenGuard)
    async createCampaign(@Request() req: any, @Body() dto: CreateCampaignDto) {
        const campaign = await this.adsService.createCampaign(req.user.userId, dto);
        return { campaign };
    }

    /**
     * Get my campaigns
     */
    @Get('campaigns')
    @UseGuards(AccessTokenGuard)
    async getMyCampaigns(@Request() req: any) {
        const campaigns = await this.adsService.getAdvertiserCampaigns(req.user.userId);
        return { campaigns };
    }

    /**
     * Get single campaign
     */
    @Get('campaigns/:id')
    @UseGuards(AccessTokenGuard)
    async getCampaign(@Param('id') id: string) {
        const campaign = await this.adsService.getCampaign(id);
        return { campaign };
    }

    /**
     * Update campaign
     */
    @Put('campaigns/:id')
    @UseGuards(AccessTokenGuard)
    async updateCampaign(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
        const campaign = await this.adsService.updateCampaign(id, dto);
        return { campaign };
    }

    /**
     * Delete campaign
     */
    @Delete('campaigns/:id')
    @UseGuards(AccessTokenGuard)
    async deleteCampaign(@Param('id') id: string) {
        await this.adsService.deleteCampaign(id);
        return { deleted: true };
    }

    /**
     * Get ads for placement (public)
     */
    @Get('placement/:placement')
    async getAdsForPlacement(
        @Param('placement') placement: string,
        @Query('city') city?: string,
        @Query('sector') sector?: string,
        @Query('age') age?: number,
    ) {
        const userContext = { city, sector, age: age ? parseInt(age as any) : undefined };
        const ads = await this.adsService.getAdsForPlacement(placement as any, userContext);
        return { ads };
    }

    /**
     * Log impression
     */
    @Post('impression')
    async logImpression(
        @Body() dto: LogImpressionDto,
        @Request() req: any,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ) {
        await this.adsService.logImpression(
            dto.campaignId,
            dto.placement,
            req.user?.userId,
            dto.userContext,
            { ipAddress: ip, userAgent },
        );
        return { logged: true };
    }

    /**
     * Log click
     */
    @Post('click/:campaignId')
    async logClick(@Param('campaignId') campaignId: string, @Request() req: any) {
        await this.adsService.logClick(campaignId, req.user?.userId);
        return { logged: true };
    }

    /**
     * Get campaign analytics
     */
    @Get('campaigns/:id/analytics')
    @UseGuards(AccessTokenGuard)
    async getCampaignAnalytics(
        @Param('id') id: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const analytics = await this.adsService.getCampaignAnalytics(
            id,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
        return { analytics };
    }

    /**
     * Get advertiser statistics
     */
    @Get('stats')
    @UseGuards(AccessTokenGuard)
    async getStats(@Request() req: any) {
        const stats = await this.adsService.getAdvertiserStats(req.user.userId);
        return { stats };
    }
}
