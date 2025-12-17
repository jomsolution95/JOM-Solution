import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { AccessTokenGuard } from '../auth/guards/at.guard';

@Controller('applications')
@UseGuards(AccessTokenGuard)
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    @Post(':jobId')
    async apply(
        @Request() req: any,
        @Param('jobId') jobId: string,
        @Body() body: { cvId: string, coverLetter?: string }
    ) {
        return this.applicationsService.apply(req.user.userId, jobId, body.cvId, body.coverLetter);
    }

    @Get('me')
    async getMyApplications(@Request() req: any) {
        return this.applicationsService.findAllByApplicant(req.user.userId);
    }

    @Get('job/:jobId')
    async getJobApplications(@Request() req: any, @Param('jobId') jobId: string) {
        return this.applicationsService.findAllByJob(jobId, req.user.userId);
    }
}
