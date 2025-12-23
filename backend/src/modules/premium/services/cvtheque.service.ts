import {
    Injectable,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PremiumService } from '../premium.service';
import { SubscriptionPlan } from '../schemas/subscription.schema';
import { QuotaType } from '../schemas/premiumQuotas.schema';
import { ProfileView, ProfileViewDocument } from '../schemas/profileViews.schema';
import { FavoriteProfile, FavoriteProfileDocument } from '../schemas/favoriteProfile.schema';
import { SearchCVDto } from '../dto/search-cv.dto';

@Injectable()
export class CVthequeService {
    constructor(
        @InjectModel(ProfileView.name)
        private profileViewModel: Model<ProfileViewDocument>,
        @InjectModel(FavoriteProfile.name)
        private favoriteModel: Model<FavoriteProfileDocument>,
        private premiumService: PremiumService,
    ) { }

    /**
     * Search profiles in CVthèque
     */
    async searchProfiles(
        userId: string | Types.ObjectId,
        dto: SearchCVDto,
    ): Promise<{
        profiles: any[];
        total: number;
        page: number;
        limit: number;
        quotaUsed: number;
        quotaLimit: number;
    }> {
        // Check if user has Company Biz plan
        const hasPlan = await this.premiumService.verifyPlan(userId, SubscriptionPlan.COMPANY_BIZ);
        if (!hasPlan) {
            throw new ForbiddenException('CVthèque access requires Company Biz subscription');
        }

        // Check quota
        const hasQuota = await this.premiumService.hasQuotaAvailable(userId, QuotaType.CV_VIEWS);
        if (!hasQuota) {
            const remaining = await this.premiumService.getRemainingQuota(userId, QuotaType.CV_VIEWS);
            throw new ForbiddenException(`CV views quota exceeded. ${remaining} views remaining this month.`);
        }

        // Build search query
        const query: any = {
            role: 'individual', // Only search individual profiles
            isActive: true,
            _id: { $ne: userId }, // Exclude current user
        };

        if (dto.skills) {
            query['profile.skills'] = { $regex: dto.skills, $options: 'i' };
        }

        if (dto.city || dto.location) {
            query['profile.location'] = { $regex: dto.city || dto.location, $options: 'i' };
        }

        if (dto.minExperience !== undefined || dto.maxExperience !== undefined) {
            query['profile.experience'] = {};
            if (dto.minExperience !== undefined) {
                query['profile.experience'].$gte = dto.minExperience;
            }
            if (dto.maxExperience !== undefined) {
                query['profile.experience'].$lte = dto.maxExperience;
            }
        }

        if (dto.education) {
            query['profile.education'] = { $regex: dto.education, $options: 'i' };
        }

        if (dto.availability) {
            query['profile.availability'] = dto.availability;
        }

        if (dto.languages && dto.languages.length > 0) {
            query['profile.languages'] = { $in: dto.languages };
        }

        const page = dto.page || 1;
        const limit = dto.limit || 20;
        const skip = (page - 1) * limit;

        // Get total count
        // Note: This would query your User/Profile collection
        // For now, returning mock data structure
        const total = 0; // await this.userModel.countDocuments(query);
        const profiles: any[] = []; // await this.userModel.find(query).skip(skip).limit(limit);

        // Get quota info
        const quotaInfo = await this.premiumService.getUserQuotas(userId);
        const cvViewsQuota = quotaInfo[QuotaType.CV_VIEWS] || { used: 0, limit: 50 };

        return {
            profiles,
            total,
            page,
            limit,
            quotaUsed: cvViewsQuota.used,
            quotaLimit: cvViewsQuota.limit,
        };
    }

    /**
     * View a profile (increments quota and logs view)
     */
    async viewProfile(
        userId: string | Types.ObjectId,
        profileId: string | Types.ObjectId,
    ): Promise<any> {
        // Check plan
        const hasPlan = await this.premiumService.verifyPlan(userId, SubscriptionPlan.COMPANY_BIZ);
        if (!hasPlan) {
            throw new ForbiddenException('CVthèque access requires Company Biz subscription');
        }

        // Check and increment quota
        const hasQuota = await this.premiumService.hasQuotaAvailable(userId, QuotaType.CV_VIEWS);
        if (!hasQuota) {
            throw new ForbiddenException('CV views quota exceeded');
        }

        // Increment quota
        await this.premiumService.incrementQuota(userId, QuotaType.CV_VIEWS);

        // Log profile view
        await this.profileViewModel.create({
            profileId: new Types.ObjectId(profileId),
            viewerId: new Types.ObjectId(userId),
            date: new Date(),
            source: 'cvtheque',
            metadata: {
                device: 'web',
            },
        });

        // Return profile data
        // Note: This would fetch from your User/Profile collection
        return {
            profileId,
            viewed: true,
            quotaIncremented: true,
        };
    }

    /**
     * Add profile to favorites
     */
    async addFavorite(
        userId: string | Types.ObjectId,
        profileId: string | Types.ObjectId,
        notes?: string,
    ): Promise<FavoriteProfileDocument> {
        // Check if already favorited
        const existing = await this.favoriteModel.findOne({
            recruiterId: new Types.ObjectId(userId),
            profileId: new Types.ObjectId(profileId),
        });

        if (existing) {
            throw new BadRequestException('Profile already in favorites');
        }

        const favorite = new this.favoriteModel({
            recruiterId: new Types.ObjectId(userId),
            profileId: new Types.ObjectId(profileId),
            notes,
            metadata: {
                addedAt: new Date(),
            },
        });

        return await favorite.save();
    }

    /**
     * Remove from favorites
     */
    async removeFavorite(
        userId: string | Types.ObjectId,
        profileId: string | Types.ObjectId,
    ): Promise<void> {
        const result = await this.favoriteModel.deleteOne({
            recruiterId: new Types.ObjectId(userId),
            profileId: new Types.ObjectId(profileId),
        });

        if (result.deletedCount === 0) {
            throw new NotFoundException('Favorite not found');
        }
    }

    /**
     * Get user's favorites
     */
    async getFavorites(userId: string | Types.ObjectId): Promise<FavoriteProfileDocument[]> {
        return this.favoriteModel
            .find({ recruiterId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 });
    }

    /**
     * Update notes for a favorite
     */
    async updateNotes(
        userId: string | Types.ObjectId,
        profileId: string | Types.ObjectId,
        notes: string,
    ): Promise<FavoriteProfileDocument> {
        const favorite = await this.favoriteModel.findOne({
            recruiterId: new Types.ObjectId(userId),
            profileId: new Types.ObjectId(profileId),
        });

        if (!favorite) {
            throw new NotFoundException('Favorite not found');
        }

        favorite.notes = notes;
        return await favorite.save();
    }

    /**
     * Get profile view history for recruiter
     */
    async getViewHistory(userId: string | Types.ObjectId): Promise<ProfileViewDocument[]> {
        return this.profileViewModel
            .find({
                viewerId: new Types.ObjectId(userId),
                source: 'cvtheque',
            })
            .sort({ date: -1 })
            .limit(100);
    }

    /**
     * Check if profile is favorited
     */
    async isFavorite(
        userId: string | Types.ObjectId,
        profileId: string | Types.ObjectId,
    ): Promise<boolean> {
        const count = await this.favoriteModel.countDocuments({
            recruiterId: new Types.ObjectId(userId),
            profileId: new Types.ObjectId(profileId),
        });
        return count > 0;
    }

    /**
     * Count followers (favorites) for a profile
     */
    async countFollowers(profileId: string | Types.ObjectId): Promise<number> {
        return this.favoriteModel.countDocuments({
            profileId: new Types.ObjectId(profileId),
        });
    }
}
