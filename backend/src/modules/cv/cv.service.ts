import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cv, CvDocument } from './schemas/cv.schema';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { PremiumService } from '../premium/premium.service';

@Injectable()
export class CvService {
    constructor(
        @InjectModel(Cv.name) private cvModel: Model<CvDocument>,
        private premiumService: PremiumService
    ) { }

    async create(userId: string, createCvDto: CreateCvDto): Promise<Cv> {
        // Freemium Check
        const hasPremium = await this.premiumService.hasActiveSubscription(userId);
        if (!hasPremium) {
            const count = await this.cvModel.countDocuments({ userId });
            if (count >= 1) {
                throw new ForbiddenException('Le plan Gratuit est limité à 1 CV. Passez Premium pour en créer plusieurs !');
            }
        }

        const newCv = new this.cvModel({
            userId,
            ...createCvDto,
        });
        return newCv.save();
    }

    async findAll(userId: string): Promise<Cv[]> {
        return this.cvModel.find({ userId }).sort({ updatedAt: -1 }).exec();
    }

    async findOne(id: string, userId: string): Promise<Cv> {
        const cv = await this.cvModel.findById(id).exec();
        if (!cv) {
            throw new NotFoundException(`CV with ID ${id} not found`);
        }
        if (cv.userId.toString() !== userId) {
            throw new ForbiddenException('You do not have permission to access this CV');
        }
        return cv;
    }

    async update(id: string, userId: string, updateCvDto: UpdateCvDto): Promise<Cv> {
        const cv = await this.cvModel.findById(id).exec();
        if (!cv) {
            throw new NotFoundException(`CV with ID ${id} not found`);
        }
        if (cv.userId.toString() !== userId) {
            throw new ForbiddenException('You do not have permission to modify this CV');
        }

        return this.cvModel.findByIdAndUpdate(id, updateCvDto, { new: true }).exec() as Promise<CvDocument>;
    }

    async remove(id: string, userId: string): Promise<void> {
        const cv = await this.cvModel.findById(id).exec();
        if (!cv) {
            throw new NotFoundException(`CV with ID ${id} not found`);
        }
        if (cv.userId.toString() !== userId) {
            throw new ForbiddenException('You do not have permission to delete this CV');
        }
        await this.cvModel.findByIdAndDelete(id).exec();
    }
}
