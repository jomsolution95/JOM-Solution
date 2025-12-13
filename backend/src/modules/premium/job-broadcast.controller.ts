import {
    Controller,
    Post,
    Get,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JobBroadcastService } from './services/job-broadcast.service';

@Controller('jobs/broadcast')
@UseGuards(JwtAuthGuard)
export class JobBroadcastController {
    constructor(private readonly broadcastService: JobBroadcastService) { }

    /**
     * Manually trigger broadcast for a job
     */
    @Post(':jobId')
    async broadcastJob(@Param('jobId') jobId: string) {
        await this.broadcastService.manualBroadcast(jobId);
        return {
            success: true,
            message: 'Job broadcast initiated successfully'
        };
    }

    /**
     * Get broadcast statistics for a job
     */
    @Get(':jobId/stats')
    async getBroadcastStats(@Param('jobId') jobId: string) {
        const stats = await this.broadcastService.getBroadcastStats(jobId);
        return { stats };
    }
}
