import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchDto } from '../../common/dto/search.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('profiles')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) { }

    @Post()
    @UseGuards(AccessTokenGuard)
    create(@Body() createProfileDto: CreateProfileDto, @GetUser('sub') userId: string) {
        return this.profilesService.create(createProfileDto, userId);
    }

    @Get()
    @UseGuards(AccessTokenGuard)
    findAll(@Query() paginationDto: PaginationDto, @GetUser('sub') userId: string) {
        console.log(`[ProfilesController] findAll - User ID from Token: ${userId}`);
        return this.profilesService.findAll(paginationDto, {}, userId);
    }

    @Get('search')
    @UseGuards(AccessTokenGuard)
    search(@Query() searchDto: SearchDto, @GetUser('sub') userId: string) {
        return this.profilesService.search(searchDto, userId);
    }

    @Get('user/:userId')
    findByUserId(@Param('userId') userId: string) {
        return this.profilesService.findByUserId(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.profilesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AccessTokenGuard)
    update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto, @GetUser('sub') userId: string) {
        return this.profilesService.update(id, updateProfileDto, userId);
    }
    @Post('me/documents')
    @UseGuards(AccessTokenGuard)
    addDocument(@GetUser('sub') userId: string, @Body() document: { name: string; url: string; type: string; date: Date }) {
        return this.profilesService.addDocument(userId, document);
    }

    @Post('avatar')
    @UseGuards(AccessTokenGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(@GetUser('sub') userId: string, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Aucun fichier fourni ou format invalide');
        }
        return this.profilesService.uploadAvatar(userId, file);
    }
}
