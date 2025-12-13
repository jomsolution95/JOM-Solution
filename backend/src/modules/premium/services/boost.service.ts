import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Boost, BoostDocument, BoostType, BoostStatus } from '../schemas/boosts.schema';
import { CreateBoostDto } from '../dto/create-boost.dto';
import { StripeService } from './stripe.service';
import { WaveService } from './wave.service';
import { OrangeMoneyService } from './orange-money.service';
import { Cron, CronExpression } from '@nestjs/schedule';

const BOOST_PRICES = {
    [BoostType.PROFILE_STAR]: 2000,
    [BoostType.PROFILE_URGENT]: 1000,
    [BoostType.JOB_FEATURED]: 5000,
    [BoostType.JOB_URGENT]: 2000,
    [BoostType.JOB_PUSH_NOTIFICATION]: 15000,
    [BoostType.TRAINING_FEATURED]: 10000,
    [BoostType.TRAINING_OPEN_HOUSE]: 5000,
    [BoostType.TRAINING_EMAIL_CAMPAIGN]: 20000,
    [BoostType.APPLICATION_RELANCE]: 500,
};

const BOOST_DURATIONS = {
    [BoostType.PROFILE_STAR]: 7,
    [BoostType.PROFILE_URGENT]: 14,
    [BoostType.JOB_FEATURED]: 7,
    [BoostType.JOB_URGENT]: 14,
    [BoostType.JOB_PUSH_NOTIFICATION]: 1,
    [BoostType.TRAINING_FEATURED]: 15,
    [BoostType.TRAINING_OPEN_HOUSE]: 7,
    [BoostType.TRAINING_EMAIL_CAMPAIGN]: 1,
    [BoostType.APPLICATION_RELANCE]: 1,
};

@Injectable()
export class BoostService {
    constructor(
        @InjectModel(Boost.name)
        private boostModel: Model<BoostDocument>,
        private stripeService: StripeService,
        private waveService: WaveService,
        private orangeMoneyService: OrangeMoneyService,
    ) { }

    /**
     * Create a boost
     */
    async createBoost(
        userId: string | Types.ObjectId,
        dto: CreateBoostDto,
    ): Promise<{
        boost: BoostDocument;
        paymentUrl?: string;
        clientSecret?: string;
        transactionId?: string;
    }> {
        const price = dto.price || BOOST_PRICES[dto.type];
        const duration = dto.duration || BOOST_DURATIONS[dto.type];
        const currency = dto.currency || 'XOF';

        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + duration);

        // Create boost
        const boost = new this.boostModel({
            userId: new Types.ObjectId(userId),
            type: dto.type,
            targetId: new Types.ObjectId(dto.targetId),
            targetType: dto.targetType,
            startDate: now,
            endDate,
            status: BoostStatus.PENDING,
            price,
            currency,
            analytics: {
                views: 0,
                clicks: 0,
                applications: 0,
                conversions: 0,
            },
        });

        await boost.save();

        // Process payment if payment method provided
        if (dto.paymentMethod) {
            let result: any = {};

            switch (dto.paymentMethod) {
                case 'wave':
                    if (!dto.phoneNumber) {
                        throw new BadRequestException('Phone number required for Wave payment');
                    }
                    const wavePayment = await this.waveService.initiatePayment(
                        price,
                        currency,
                        dto.phoneNumber,
                        {
                            boostId: boost._id.toString(),
                            type: dto.type,
                        },
                    );
                    result = {
                        paymentUrl: wavePayment.checkoutUrl,
                        transactionId: wavePayment.transactionId,
                    };
                    boost.paymentId = wavePayment.transactionId;
                    break;

                case 'orange_money':
                    if (!dto.phoneNumber) {
                        throw new BadRequestException('Phone number required for Orange Money payment');
                    }
                    const omPayment = await this.orangeMoneyService.initiatePayment(
                        price,
                        currency,
                        dto.phoneNumber,
                        {
                            boostId: boost._id.toString(),
                            type: dto.type,
                        },
                    );
                    result = {
                        paymentUrl: omPayment.paymentUrl,
                        transactionId: omPayment.transactionId,
                    };
                    boost.paymentId = omPayment.transactionId;
                    break;

                case 'stripe':
                    const stripePayment = await this.stripeService.createPaymentIntent(price, currency, {
                        boostId: boost._id.toString(),
                        type: dto.type,
                    });
                    result = {
                        clientSecret: stripePayment.client_secret,
                        transactionId: stripePayment.id,
                    };
                    boost.paymentId = stripePayment.id;
                    break;

                default:
                    throw new BadRequestException('Invalid payment method');
            }

            await boost.save();
            return { boost, ...result };
        }

        return { boost };
    }

    /**
     * Activate boost after payment
     */
    async activateBoost(boostId: string | Types.ObjectId): Promise<BoostDocument> {
        const boost = await this.boostModel.findById(boostId);
        if (!boost) {
            throw new NotFoundException('Boost not found');
        }

        boost.status = BoostStatus.ACTIVE;
        return await boost.save();
    }

    /**
     * Get active boosts for a target
     */
    async getActiveBoosts(targetId: string | Types.ObjectId): Promise<BoostDocument[]> {
        const now = new Date();
        return this.boostModel.find({
            targetId: new Types.ObjectId(targetId),
            status: BoostStatus.ACTIVE,
            startDate: { $lte: now },
            endDate: { $gte: now },
        });
    }

    /**
     * Get user's boosts
     */
    async getUserBoosts(userId: string | Types.ObjectId): Promise<BoostDocument[]> {
        return this.boostModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ createdAt: -1 });
    }

    /**
     * Check if target has active boost
     */
    async hasActiveBoost(
        targetId: string | Types.ObjectId,
        boostType?: BoostType,
    ): Promise<boolean> {
        const query: any = {
            targetId: new Types.ObjectId(targetId),
            status: BoostStatus.ACTIVE,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
        };

        if (boostType) {
            query.type = boostType;
        }

        const count = await this.boostModel.countDocuments(query);
        return count > 0;
    }

    /**
     * Increment boost analytics
     */
    async incrementAnalytics(
        boostId: string | Types.ObjectId,
        metric: 'views' | 'clicks' | 'applications' | 'conversions',
    ): Promise<void> {
        await this.boostModel.findByIdAndUpdate(boostId, {
            $inc: { [`analytics.${metric}`]: 1 },
        });
    }

    /**
     * Cancel boost
     */
    async cancelBoost(boostId: string | Types.ObjectId): Promise<BoostDocument> {
        const boost = await this.boostModel.findById(boostId);
        if (!boost) {
            throw new NotFoundException('Boost not found');
        }

        boost.status = BoostStatus.CANCELLED;
        return await boost.save();
    }

    /**
     * Cron job to expire old boosts (runs every hour)
     */
    @Cron(CronExpression.EVERY_HOUR)
    async expireOldBoosts(): Promise<void> {
        const now = new Date();
        const result = await this.boostModel.updateMany(
            {
                status: BoostStatus.ACTIVE,
                endDate: { $lt: now },
            },
            {
                $set: { status: BoostStatus.EXPIRED },
            },
        );

        console.log(`Expired ${result.modifiedCount} boosts`);
    }

    /**
     * Get boosted items for search/listing (prioritized)
     */
    async getBoostedItems(
        targetType: string,
        boostType: BoostType,
    ): Promise<Types.ObjectId[]> {
        const now = new Date();
        const boosts = await this.boostModel
            .find({
                targetType,
                type: boostType,
                status: BoostStatus.ACTIVE,
                startDate: { $lte: now },
                endDate: { $gte: now },
            })
            .select('targetId')
            .sort({ createdAt: -1 });

        return boosts.map((b) => b.targetId);
    }
}
