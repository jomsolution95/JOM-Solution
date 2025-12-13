import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('cv')
@UseGuards(AccessTokenGuard, RolesGuard)
export class CvController {
    constructor(private readonly cvService: CvService) { }

    @Post()
    create(@Request() req: any, @Body() createCvDto: CreateCvDto) {
        return this.cvService.create(req.user.userId, createCvDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.cvService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.cvService.findOne(id, req.user.userId);
    }

    @Put(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
        return this.cvService.update(id, req.user.userId, updateCvDto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.cvService.remove(id, req.user.userId);
    }
}
