import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RecruitmentPackService } from './services/recruitment-pack.service';
import { PurchasePackDto, ConsumePackDto } from './dto/recruitment-pack.dto';

@Controller('recruitment-packs')
@UseGuards(JwtAuthGuard)
export class RecruitmentPackController {
    constructor(private readonly packService: RecruitmentPackService) { }

    /**
     * Get pack pricing
     */
    @Get('pricing')
    async getPricing() {
        const pricing = this.packService.getPackPricing();
        return { pricing };
    }

    /**
     * Purchase a pack
     */
    @Post('purchase')
    async purchasePack(@Request() req: any, @Body() dto: PurchasePackDto) {
        const result = await this.packService.purchasePack(req.user.userId, dto);
        return result;
    }

    /**
     * Get company's packs
     */
    @Get()
    async getMyPacks(@Request() req: any) {
        const packs = await this.packService.getCompanyPacks(req.user.userId);
        return { packs };
    }

    /**
     * Get active pack
     */
    @Get('active')
    async getActivePack(@Request() req: any) {
        const pack = await this.packService.getActivePack(req.user.userId);
        return { pack };
    }

    /**
     * Get total remaining credits
     */
    @Get('credits/remaining')
    async getRemainingCredits(@Request() req: any) {
        const remaining = await this.packService.getTotalRemainingCredits(req.user.userId);
        return { remaining };
    }

    /**
     * Consume a credit
     */
    @Post('consume')
    async consumeCredit(@Request() req: any, @Body() dto: ConsumePackDto) {
        const pack = await this.packService.consumeCredit(req.user.userId, dto.jobId);
        return { pack };
    }

    /**
     * Get pack statistics
     */
    @Get('stats')
    async getStats(@Request() req: any) {
        const stats = await this.packService.getPackStats(req.user.userId);
        return { stats };
    }

    /**
     * Get single pack
     */
    @Get(':id')
    async getPack(@Param('id') id: string) {
        const pack = await this.packService.getPack(id);
        return { pack };
    }
}
