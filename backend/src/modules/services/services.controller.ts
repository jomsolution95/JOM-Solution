import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchDto } from '../../common/dto/search.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Post()
    @UseGuards(AccessTokenGuard)
    create(@Body() createServiceDto: CreateServiceDto, @GetUser('sub') userId: string) {
        return this.servicesService.create(createServiceDto, userId);
    }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300)
    @Get()
    findAll(
        @Query() paginationDto: PaginationDto,
        @Query('category') category?: string,
        @Query('minPrice') minPrice?: number,
        @Query('maxPrice') maxPrice?: number,
        @Query('rating') rating?: number,
    ) {
        const filters: any = {};
        if (category) filters.category = category;
        if (minPrice) filters.minPrice = minPrice;
        if (maxPrice) filters.maxPrice = maxPrice;
        if (rating) filters.rating = { $gte: rating };

        return this.servicesService.findAll(paginationDto, filters);
    }

    @Get('search')
    search(@Query() searchDto: SearchDto) {
        return this.servicesService.search(searchDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.servicesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AccessTokenGuard)
    update(
        @Param('id') id: string,
        @Body() updateServiceDto: UpdateServiceDto,
        @GetUser('sub') userId: string,
        @GetUser('roles') roles: string[],
    ) {
        const isAdmin = roles.includes('admin');
        return this.servicesService.update(id, updateServiceDto, userId, isAdmin);
    }

    @Delete(':id')
    @UseGuards(AccessTokenGuard)
    remove(@Param('id') id: string, @GetUser('sub') userId: string, @GetUser('roles') roles: string[]) {
        const isAdmin = roles.includes('admin');
        return this.servicesService.remove(id, userId, isAdmin);
    }
}
