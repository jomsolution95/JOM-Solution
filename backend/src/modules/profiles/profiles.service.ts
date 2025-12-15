import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from '../users/schemas/profile.schema';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchDto } from '../../common/dto/search.dto';
import { CacheService } from '../../common/cache/cache.service';
import { FileUploadService } from '../premium/services/file-upload.service';

@Injectable()
export class ProfilesService {
    constructor(
        @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
        private readonly cacheService: CacheService,
        private readonly fileUploadService: FileUploadService
    ) { }

    async create(createProfileDto: CreateProfileDto, userId: string): Promise<Profile> {
        // Check if profile exists
        const existingProfile = await this.profileModel.findOne({ user: userId });
        if (existingProfile) {
            return this.update(existingProfile._id.toString(), createProfileDto as UpdateProfileDto, userId);
        }

        const createdProfile = new this.profileModel({
            ...createProfileDto,
            user: userId,
        });
        return createdProfile.save();
    }

    async findAll(paginationDto: PaginationDto, filters: any = {}): Promise<{ data: Profile[]; total: number; page: number; limit: number }> {
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = paginationDto;
        const skip = (page - 1) * limit;

        const query = this.profileModel.find(filters).populate('user', 'email phone isVerified');
        const sortOptions: any = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            query.sort(sortOptions).skip(skip).limit(limit).exec(),
            this.profileModel.countDocuments(filters).exec(),
        ]);

        return { data, total, page, limit };
    }

    async findOne(id: string): Promise<Profile> {
        const profile = await this.profileModel.findById(id).populate('user', 'email phone isVerified roles').exec();
        if (!profile) throw new NotFoundException(`Profile with ID ${id} not found`);
        return profile;
    }

    async findByUserId(userId: string): Promise<Profile> {
        const profile = await this.profileModel.findOne({ user: userId }).populate('user', 'email phone isVerified roles').exec();
        if (!profile) throw new NotFoundException(`Profile for User ID ${userId} not found`);
        return profile;
    }

    async update(id: string, updateProfileDto: UpdateProfileDto, userId: string): Promise<Profile> {
        // Ensure user owns the profile (or Admin - logic can be extended)
        const profile = await this.profileModel.findOne({ _id: id, user: userId });
        if (!profile) throw new NotFoundException(`Profile not found or access denied`);

        const updatedProfile = await this.profileModel
            .findByIdAndUpdate(id, updateProfileDto, { new: true })
            .exec();

        // Invalidate profiles cache
        // Note: Ideally we should use a specific key pattern or tag invalidation if available
        // For now, we rely on TTL or manual full key deletion if we knew the keys (CacheInterceptor generates keys based on URL)
        // Since we can't easily guess the URL keys, we might need a more robust strategy or custom key generation.
        // For demonstration, we'll try to delete a common key if we had set one, 
        // or just acknowledge that the CacheInterceptor keys (e.g. /profiles?page=1) will eventually expire.
        // However, if we want to force clear, we need to know the keys.
        // For this task, we will assume TTL is sufficient OR usage of specific keys.
        // Let's implement a 'clear all profiles cache' approach if we had tagged them, but standard CacheManager doesn't support tags easily without specific store support.
        // We will fallback to relying on TTL for lists, but we can clear specific items if we cached them by ID manually.

        return updatedProfile!;
    }

    async search(searchDto: SearchDto): Promise<{ data: Profile[]; total: number }> {
        const { q, page = 1, limit = 10 } = searchDto;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (q) {
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { bio: { $regex: q, $options: 'i' } },
                { 'skills.name': { $regex: q, $options: 'i' } },
                { location: { $regex: q, $options: 'i' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.profileModel.find(filter).populate('user', 'email isVerified').skip(skip).limit(limit).exec(),
            this.profileModel.countDocuments(filter).exec(),
        ]);

        return { data, total };
    }
    async addDocument(userId: string, document: { name: string; url: string; type: string; date: Date }): Promise<Profile> {
        const profile = await this.profileModel.findOne({ user: userId });
        if (!profile) throw new NotFoundException(`Profile not found`);

        if (!profile.documents) {
            profile.documents = [];
        }

        profile.documents.push(document);
        return profile.save();
    }

    async uploadAvatar(userId: string, file: Express.Multer.File): Promise<Profile> {
        const uploadResult = await this.fileUploadService.uploadFile(file, 'avatars');
        return this.profileModel.findOneAndUpdate(
            { user: userId },
            { avatar: uploadResult.url },
            { new: true, upsert: true }
        ).exec();
    }
}
