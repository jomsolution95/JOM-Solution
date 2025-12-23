import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchDto } from '../../common/dto/search.dto';

@Controller('users')
@UseGuards(AccessTokenGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    findAll(@Query() paginationDto: PaginationDto, @Query('role') role?: UserRole) {
        const filters: any = {};
        if (role) filters.roles = role;
        return this.usersService.findAll(paginationDto, filters);
    }

    @Get('search')
    @Roles(UserRole.ADMIN)
    search(@Query() searchDto: SearchDto) {
        return this.usersService.search(searchDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
    @Post('block/:targetId')
    async blockUser(@Req() req: any, @Param('targetId') targetId: string) {
        return this.usersService.blockUser(req.user.userId, targetId);
    }

    @Post('unblock/:targetId')
    async unblockUser(@Req() req: any, @Param('targetId') targetId: string) {
        return this.usersService.unblockUser(req.user.userId, targetId);
    }

    @Get('me/settings')
    async getSettings(@Req() req: any) {
        const user = await this.usersService.findOne(req.user.userId);
        // @ts-ignore
        return user.settings || {};
    }

    @Patch('me/settings')
    async updateSettings(@Req() req: any, @Body() settings: any) {
        const updates: any = {};
        for (const key of Object.keys(settings)) {
            updates[`settings.${key}`] = settings[key];
        }
        return this.usersService.update(req.user.userId, updates);
    }
}
