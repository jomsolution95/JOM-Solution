import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile, ProfileDocument } from '../users/schemas/profile.schema';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchDto } from '../../common/dto/search.dto';
import { CacheService } from '../../common/cache/cache.service';
import { FileUploadService } from '../premium/services/file-upload.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfilesService {
    constructor(
        @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
        private readonly cacheService: CacheService,
        private readonly fileUploadService: FileUploadService,
        private readonly usersService: UsersService
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

    async findAll(paginationDto: PaginationDto, filters: any = {}, excludeUserId?: string): Promise<{ data: Profile[]; total: number; page: number; limit: number }> {
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = paginationDto;
        const skip = (page - 1) * limit;

        const queryFilters = { ...filters };
        // Chunk 1: Uncomment exclusion
        if (excludeUserId) {
            queryFilters.user = { $ne: excludeUserId };
        }



        console.log(`[ProfilesService] findAll - Filter user != ${excludeUserId}`);

        const query = this.profileModel.find(queryFilters).populate('user', 'email phone isVerified');
        const sortOptions: any = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            query.sort(sortOptions).skip(skip).limit(limit).exec(),
            this.profileModel.countDocuments(queryFilters).exec(),
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

        if (!profile) {
            console.log(`[AUTO-HEAL] Profile missing for user ${userId}. Creating default profile.`);
            try {
                const newProfile = new this.profileModel({
                    user: userId,
                    firstName: '',
                    lastName: '',
                    skills: []
                });
                const saved = await newProfile.save();
                // Re-fetch to populate user
                const populated = await this.profileModel.findById(saved._id).populate('user', 'email phone isVerified roles').exec();
                if (!populated) throw new Error('Failed to fetch created profile');
                return populated;
            } catch (err) {
                console.error(`[AUTO-HEAL] Failed to create profile for ${userId}`, err);
                throw new NotFoundException(`Profile for User ID ${userId} not found and auto-creation failed`);
            }
        }

        return profile;
    }

    async update(id: string, updateProfileDto: UpdateProfileDto, userId: string): Promise<Profile> {
        // Ensure user owns the profile (or Admin - logic can be extended)
        const profile = await this.profileModel.findOne({ _id: id, user: userId });
        if (!profile) throw new NotFoundException(`Profile not found or access denied`);

        const updatedProfile = await this.profileModel
            .findByIdAndUpdate(id, updateProfileDto, { new: true })
            .exec();

        if (updatedProfile) {
            // Sync with User entity for persistent login state
            const userUpdates: any = {};
            if (updatedProfile.displayName) userUpdates.name = updatedProfile.displayName;
            if (updatedProfile.avatarUrl) userUpdates.avatar = updatedProfile.avatarUrl;
            if (updatedProfile.phone) userUpdates.phone = updatedProfile.phone;

            if (Object.keys(userUpdates).length > 0) {
                try {
                    await this.usersService.update(userId, userUpdates);
                } catch (err) {
                    console.error('Failed to sync user profile updates', err);
                }
            }
        }
        return updatedProfile!;
    }

    async search(searchDto: SearchDto, excludeUserId?: string): Promise<{ data: Profile[]; total: number }> {
        const { q, page = 1, limit = 10 } = searchDto;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (q) {
            filter.$or = [
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } },
                { title: { $regex: q, $options: 'i' } },
                { bio: { $regex: q, $options: 'i' } },
                { 'skills.name': { $regex: q, $options: 'i' } },
                { location: { $regex: q, $options: 'i' } },
            ];
        }

        if (excludeUserId) {
            filter.user = { $ne: excludeUserId };
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

        // Sync with User entity for persistent login state
        try {
            await this.usersService.update(userId, { avatar: uploadResult.url } as any);
        } catch (err) {
            console.error('Failed to sync user avatar update', err);
        }

        return this.profileModel.findOneAndUpdate(
            { user: userId },
            { avatarUrl: uploadResult.url },
            { new: true, upsert: true }
        ).exec();
    }

    async uploadCover(userId: string, file: Express.Multer.File): Promise<Profile> {
        const uploadResult = await this.fileUploadService.uploadFile(file, 'covers');
        return this.profileModel.findOneAndUpdate(
            { user: userId },
            { coverUrl: uploadResult.url },
            { new: true, upsert: true }
        ).exec();
    }
}
