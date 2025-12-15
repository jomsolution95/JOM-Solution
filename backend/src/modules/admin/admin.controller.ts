import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AdminService } from './admin.service';
import { SchedulerService } from './scheduler.service';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly schedulerService: SchedulerService
    ) { }

    @Get('stats')
    async getStats() {
        return this.adminService.getGlobalStats();
    }

    @Get('users')
    async getUsers(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.adminService.getAllUsers(Number(limit), Number(page));
    }

    @Post('users/:id/ban')
    async banUser(@Param('id') id: string, @GetUser('sub') adminId: string) {
        return this.adminService.banUser(id, adminId);
    }

    @Get('logs')
    async getAuditLogs(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.adminService.getAuditLogs(Number(limit), Number(page));
    }

    @Get('finances/escrow')
    async getEscrowTransactions(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.adminService.getEscrowTransactions(Number(limit), Number(page));
    }

    @Post('finances/escrow/:id/resolve')
    async resolveEscrow(
        @Param('id') id: string,
        @Body() body: { decision: 'RELEASE' | 'REFUND' },
        @GetUser('sub') adminId: string
    ) {
        return this.adminService.resolveEscrow(id, body.decision, adminId);
    }

    @Get('kyc/pending')
    async getPendingKYC(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.adminService.getPendingKYC(Number(limit), Number(page));
    }

    @Post('kyc/:id/review')
    async reviewKYC(
        @Param('id') id: string,
        @Body() body: { decision: 'APPROVE' | 'REJECT'; reason?: string },
        @GetUser('sub') adminId: string
    ) {
        return this.adminService.reviewKYC(id, body.decision, body.reason, adminId);
    }

    @Post('broadcast')
    async broadcastMessage(
        @Body() body: { title: string; message: string; targetRole?: string; filters?: any },
        @GetUser('sub') adminId: string
    ) {
        return this.adminService.broadcastMessage(body.title, body.message, body.targetRole, body.filters, adminId);
    }

    @Post('schedule')
    async scheduleAction(
        @Body() body: { action: string; payload: any; executeAt: string },
        @GetUser('sub') adminId: string
    ) {
        return this.schedulerService.scheduleTask(body.action, body.payload, new Date(body.executeAt), adminId);
    }
    @Get('ads')
    async getAdCampaigns(@Query('status') status?: string) {
        return this.adminService.getAdCampaigns(status);
    }

    @Post('ads/:id/review')
    async reviewAdCampaign(
        @Param('id') id: string,
        @Body() body: { action: 'APPROVE' | 'REJECT' | 'STOP' },
        @GetUser('sub') adminId: string
    ) {
        return this.adminService.reviewAdCampaign(id, body.action, adminId);
    }
}

