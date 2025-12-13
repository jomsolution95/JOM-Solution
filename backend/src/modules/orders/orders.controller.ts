import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { OrderStatus } from '../services/schemas/order.schema';

@Controller('orders')
@UseGuards(AccessTokenGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(@Body() createOrderDto: CreateOrderDto, @GetUser('sub') userId: string) {
        return this.ordersService.create(createOrderDto, userId);
    }

    @Get()
    findAll(
        @Query() paginationDto: PaginationDto,
        @GetUser('sub') userId: string,
        @GetUser('roles') roles: string[],
    ) {
        const isAdmin = roles.includes('admin');
        return this.ordersService.findAll(paginationDto, userId, isAdmin);
    }

    @Get(':id')
    findOne(
        @Param('id') id: string,
        @GetUser('sub') userId: string,
        @GetUser('roles') roles: string[],
    ) {
        const isAdmin = roles.includes('admin');
        return this.ordersService.findOne(id, userId, isAdmin);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: OrderStatus,
        @GetUser('sub') userId: string,
        @GetUser('roles') roles: string[],
    ) {
        const isAdmin = roles.includes('admin');
        return this.ordersService.updateStatus(id, status, userId, isAdmin);
    }

    @Patch(':id/cancel')
    cancel(
        @Param('id') id: string,
        @GetUser('sub') userId: string,
        @GetUser('roles') roles: string[],
    ) {
        const isAdmin = roles.includes('admin');
        return this.ordersService.cancel(id, userId, isAdmin);
    }
}
