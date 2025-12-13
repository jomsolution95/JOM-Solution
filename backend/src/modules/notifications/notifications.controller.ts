import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('notifications')
@UseGuards(AccessTokenGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    findAll(@GetUser('sub') userId: string, @Query() paginationDto: PaginationDto) {
        return this.notificationsService.findAll(userId, paginationDto);
    }

    @Get('unread-count')
    getUnreadCount(@GetUser('sub') userId: string) {
        return this.notificationsService.getUnreadCount(userId);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string, @GetUser('sub') userId: string) {
        return this.notificationsService.markAsRead(id, userId);
    }
}
