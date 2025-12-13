import { Controller, Get, Post, Param, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

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
    async banUser(@Param('id') id: string) {
        return this.adminService.banUser(id);
    }
}
