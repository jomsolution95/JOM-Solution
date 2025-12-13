import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateSummaryDto } from './dto/generate-summary.dto';
import { AccessTokenGuard } from '../auth/guards/at.guard';

@Controller('ai')
@UseGuards(AccessTokenGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('generate-summary')
    async generateSummary(@Body() dto: GenerateSummaryDto) {
        return this.aiService.generateSummary(dto);
    }

    @Post('analyze')
    analyze(@Body() dto: any) {
        return this.aiService.analyzeCv(dto);
    }
}
