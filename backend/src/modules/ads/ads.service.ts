import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdCampaign, AdCampaignDocument, CampaignStatus, AdPlacement } from './schemas/adCampaign.schema';
import { AdImpression, AdImpressionDocument } from './schemas/adImpression.schema';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/ad-campaign.dto';

@Injectable()
export class AdsService {
    constructor(
        @InjectModel(AdCampaign.name)
        private campaignModel: Model<AdCampaignDocument>,
        @InjectModel(AdImpression.name)
        private impressionModel: Model<AdImpressionDocument>,
    ) { }

    /**
     * Create new ad campaign
     */
    async createCampaign(
        advertiserId: string | Types.ObjectId,
        dto: CreateCampaignDto,
    ): Promise<AdCampaignDocument> {
        const campaign = new this.campaignModel({
            ...dto,
            advertiserId: new Types.ObjectId(advertiserId),
            status: CampaignStatus.DRAFT,
            spent: 0,
            impressions: 0,
            clicks: 0,
            ctr: 0,
        });

        return await campaign.save();
    }

    /**
     * Get advertiser's campaigns
     */
    async getAdvertiserCampaigns(
        advertiserId: string | Types.ObjectId,
    ): Promise<AdCampaignDocument[]> {
        return this.campaignModel
            .find({ advertiserId: new Types.ObjectId(advertiserId) })
            .sort({ createdAt: -1 });
    }

    /**
     * Get single campaign
     */
    async getCampaign(campaignId: string | Types.ObjectId): Promise<AdCampaignDocument> {
        const campaign = await this.campaignModel.findById(campaignId);
        if (!campaign) {
            throw new NotFoundException('Campaign not found');
        }
        return campaign;
    }

    /**
     * Update campaign
     */
    async updateCampaign(
        campaignId: string | Types.ObjectId,
        dto: UpdateCampaignDto,
    ): Promise<AdCampaignDocument> {
        const campaign = await this.campaignModel.findByIdAndUpdate(
            campaignId,
            { $set: dto },
            { new: true },
        );

        if (!campaign) {
            throw new NotFoundException('Campaign not found');
        }

        return campaign;
    }

    /**
     * Delete campaign
     */
    async deleteCampaign(campaignId: string | Types.ObjectId): Promise<void> {
        const result = await this.campaignModel.deleteOne({ _id: campaignId });
        if (result.deletedCount === 0) {
            throw new NotFoundException('Campaign not found');
        }
    }

    /**
     * Get ads for placement with targeting
     */
    async getAdsForPlacement(
        placement: AdPlacement,
        userContext?: any,
    ): Promise<AdCampaignDocument[]> {
        const now = new Date();

        // Base query
        const query: any = {
            status: CampaignStatus.ACTIVE,
            placements: placement,
            startDate: { $lte: now },
            endDate: { $gte: now },
            $expr: { $lt: ['$spent', '$budget'] }, // Budget not exceeded
        };

        // Apply targeting filters
        if (userContext) {
            if (userContext.city) {
                query.$or = query.$or || [];
                query.$or.push(
                    { 'targeting.cities': { $exists: false } },
                    { 'targeting.cities': { $size: 0 } },
                    { 'targeting.cities': userContext.city },
                );
            }

            if (userContext.sector) {
                query.$and = query.$and || [];
                query.$and.push({
                    $or: [
                        { 'targeting.sectors': { $exists: false } },
                        { 'targeting.sectors': { $size: 0 } },
                        { 'targeting.sectors': userContext.sector },
                    ],
                });
            }

            if (userContext.age) {
                query.$and = query.$and || [];
                query.$and.push({
                    $or: [
                        { 'targeting.ageMin': { $exists: false } },
                        {
                            $and: [
                                { 'targeting.ageMin': { $lte: userContext.age } },
                                { 'targeting.ageMax': { $gte: userContext.age } },
                            ],
                        },
                    ],
                });
            }
        }

        // Get campaigns and randomize
        const campaigns = await this.campaignModel.find(query).limit(10);
        return this.shuffleArray(campaigns);
    }

    /**
     * Log impression
     */
    async logImpression(
        campaignId: string | Types.ObjectId,
        placement: string,
        userId?: string | Types.ObjectId,
        userContext?: any,
        metadata?: any,
    ): Promise<void> {
        // Create impression log
        await this.impressionModel.create({
            campaignId: new Types.ObjectId(campaignId),
            userId: userId ? new Types.ObjectId(userId) : undefined,
            placement,
            clicked: false,
            userContext,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            impressionDate: new Date(),
        });

        // Update campaign stats
        const campaign = await this.campaignModel.findById(campaignId);
        if (campaign) {
            campaign.impressions += 1;

            // Calculate cost (CPM = cost per 1000 impressions)
            const cost = campaign.cpmRate / 1000;
            campaign.spent += cost;

            await campaign.save();
        }
    }

    /**
     * Log click
     */
    async logClick(
        campaignId: string | Types.ObjectId,
        userId?: string | Types.ObjectId,
    ): Promise<void> {
        // Find recent impression
        const impression = await this.impressionModel.findOne({
            campaignId: new Types.ObjectId(campaignId),
            userId: userId ? new Types.ObjectId(userId) : undefined,
            clicked: false,
        }).sort({ impressionDate: -1 });

        if (impression) {
            impression.clicked = true;
            impression.clickedAt = new Date();
            await impression.save();
        }

        // Update campaign clicks
        await this.campaignModel.findByIdAndUpdate(campaignId, {
            $inc: { clicks: 1 },
        });
    }

    /**
     * Get campaign analytics
     */
    async getCampaignAnalytics(
        campaignId: string | Types.ObjectId,
        startDate?: Date,
        endDate?: Date,
    ): Promise<any> {
        const campaign = await this.getCampaign(campaignId);

        const dateFilter: any = { campaignId: new Types.ObjectId(campaignId) };
        if (startDate || endDate) {
            dateFilter.impressionDate = {};
            if (startDate) dateFilter.impressionDate.$gte = startDate;
            if (endDate) dateFilter.impressionDate.$lte = endDate;
        }

        // Impressions by date
        const impressionsByDate = await this.impressionModel.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$impressionDate' },
                    },
                    impressions: { $sum: 1 },
                    clicks: {
                        $sum: { $cond: ['$clicked', 1, 0] },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Impressions by placement
        const impressionsByPlacement = await this.impressionModel.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$placement',
                    impressions: { $sum: 1 },
                    clicks: {
                        $sum: { $cond: ['$clicked', 1, 0] },
                    },
                },
            },
        ]);

        // Demographics
        const demographics = await this.impressionModel.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        city: '$userContext.city',
                        sector: '$userContext.sector',
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        return {
            campaign: {
                name: campaign.name,
                status: campaign.status,
                budget: campaign.budget,
                spent: campaign.spent,
                remaining: campaign.budget - campaign.spent,
            },
            performance: {
                impressions: campaign.impressions,
                clicks: campaign.clicks,
                ctr: campaign.ctr,
                avgCPC: campaign.clicks > 0 ? campaign.spent / campaign.clicks : 0,
            },
            impressionsByDate,
            impressionsByPlacement,
            demographics,
        };
    }

    /**
     * Get advertiser statistics
     */
    async getAdvertiserStats(advertiserId: string | Types.ObjectId): Promise<any> {
        const campaigns = await this.campaignModel.find({
            advertiserId: new Types.ObjectId(advertiserId),
        });

        const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
        const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
        const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
        const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);

        return {
            totalCampaigns: campaigns.length,
            activeCampaigns: campaigns.filter((c) => c.status === CampaignStatus.ACTIVE).length,
            totalBudget,
            totalSpent,
            totalImpressions,
            totalClicks,
            avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        };
    }

    /**
     * Shuffle array for ad rotation
     */
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
