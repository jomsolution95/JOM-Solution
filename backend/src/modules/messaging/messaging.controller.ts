import { Controller, Get, Post, Param, Body, UseGuards, Query, Req } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('messaging')
@UseGuards(AccessTokenGuard)
export class MessagingController {
    constructor(private readonly messagingService: MessagingService) { }

    @Post('conversations')
    createConversation(@Body() createConversationDto: CreateConversationDto, @GetUser('sub') userId: string) {
        return this.messagingService.createConversation(createConversationDto, userId);
    }

    @Get('conversations')
    getUserConversations(@Query() paginationDto: PaginationDto, @GetUser('sub') userId: string) {
        return this.messagingService.getUserConversations(userId, paginationDto);
    }

    @Get('conversations/:id/messages')
    getMessages(
        @Param('id') conversationId: string,
        @Query() paginationDto: PaginationDto,
        @GetUser('sub') userId: string
    ) {
        return this.messagingService.getMessages(conversationId, paginationDto, userId);
    }
}
