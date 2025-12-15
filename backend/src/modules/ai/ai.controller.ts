import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
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

    @Post('admin-chat')
    // @UseGuards(RolesGuard) // Todo: specific admin guard if needed
    async adminChat(@Body() body: { question: string }) {
        return this.aiService.adminChat(body.question);

        @Post('chat')
        async chat(@Body() body: { message: string }, @Request() req) {
            return { answer: await this.aiService.chatWithHistory(req.user.userId, body.message) };
        }

        @Get('history')
        async getHistory(@Request() req) {
            return this.aiService.getHistory(req.user.userId);
        }
    }
}
