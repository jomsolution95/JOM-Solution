
import { Controller, Post, Body, Get, Put, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CertificateTemplate, CertificateTemplateDocument } from './schemas/certificateTemplate.schema';

@Controller('academy/certificates/templates')
@UseGuards(JwtAuthGuard)
export class CertificateTemplateController {
    constructor(
        @InjectModel(CertificateTemplate.name) private templateModel: Model<CertificateTemplateDocument>
    ) { }

    @Post()
    async create(@Request() req: any, @Body() body: any) {
        const template = new this.templateModel({
            ...body,
            institutionId: req.user.userId
        });
        return template.save();
    }

    @Get()
    async findAll(@Request() req: any) {
        return this.templateModel.find({ institutionId: req.user.userId });
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return this.templateModel.findByIdAndUpdate(id, body, { new: true });
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.templateModel.findByIdAndDelete(id);
    }
}
