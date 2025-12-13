import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Inject } from '@nestjs/common';
import { RecruitmentPackService } from './services/recruitment-pack.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('premium/webhook')
export class PremiumWebhookController {
    private readonly logger = new Logger(PremiumWebhookController.name);

    constructor(
        private readonly recruitmentPackService: RecruitmentPackService,
    ) { }

    /**
     * PayTech IPN Endpoint
     * Exposed publicly to receive payment confirmation
     */
    @Public()
    @Post('paytech')
    @HttpCode(HttpStatus.OK)
    async handlePayTechIPN(@Body() payload: any) {
        this.logger.log(`Received PayTech IPN for token: ${payload.token}`);

        try {
            const success = await this.recruitmentPackService.handlePayTechWebhook(payload);

            if (success) {
                this.logger.log(`Payment successfully verified and Pack activated for token: ${payload.token}`);
                return { success: 1 };
            } else {
                this.logger.warn(`Payment verification failed for token: ${payload.token}`);
                return { success: 0 };
            }
        } catch (error: any) {
            this.logger.error(`Error processing PayTech IPN: ${error.message}`, error.stack);
            // Even if we fail processing, we might want to return 200 to PayTech to stop retries if it's a logic error,
            // but let's return 400 if it's invalid.
            // PayTech expects JSON response.
            return { success: 0, error: error.message };
        }
    }
}
