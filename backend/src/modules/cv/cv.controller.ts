import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PremiumService } from '../premium/premium.service';
import { QuotaType } from '../premium/schemas/premiumQuotas.schema';

@Controller('cv')
@UseGuards(AccessTokenGuard, RolesGuard)
export class CvController {
    constructor(
        private readonly cvService: CvService,
        private readonly premiumService: PremiumService
    ) { }

    @Post()
    async create(@Request() req: any, @Body() createCvDto: CreateCvDto) {
        await this.premiumService.checkFreeLimit(req.user.userId, QuotaType.CV_UPDATES, 1);
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
    async update(@Request() req: any, @Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
        await this.premiumService.checkFreeLimit(req.user.userId, QuotaType.CV_UPDATES, 1);
        return this.cvService.update(id, req.user.userId, updateCvDto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.cvService.remove(id, req.user.userId);
    }
}
