import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PremiumQuota, PremiumQuotaDocument, QuotaType } from '../../modules/premium/schemas/premiumQuotas.schema';
import { SubscriptionPlan } from '../../modules/premium/schemas/subscription.schema';

@Injectable()
export class PremiumQuotaSeedService {
    private readonly logger = new Logger(PremiumQuotaSeedService.name);

    constructor(
        @InjectModel(PremiumQuota.name)
        private quotaModel: Model<PremiumQuotaDocument>,
    ) { }

    /**
     * Default quota configurations by plan
     */
    private readonly DEFAULT_QUOTAS = {
        [SubscriptionPlan.INDIVIDUAL_PRO]: {
            [QuotaType.PROFILE_BOOSTS]: { total: 5, period: 'monthly' },
            [QuotaType.APPLICATIONS]: { total: 10, period: 'monthly' },
        },
        [SubscriptionPlan.COMPANY_BIZ]: {
            [QuotaType.JOB_BOOSTS]: { total: 15, period: 'monthly' },
            [QuotaType.CV_VIEWS]: { total: 50, period: 'monthly' },
            [QuotaType.PUSH_NOTIFICATIONS]: { total: 500, period: 'monthly' },
        },
        [SubscriptionPlan.SCHOOL_EDU]: {
            [QuotaType.COURSE_UPLOADS]: { total: -1, period: 'unlimited' }, // -1 = unlimited
            [QuotaType.STUDENT_SLOTS]: { total: -1, period: 'unlimited' },
        },
    };

    /**
     * Seed default premium quotas
     */
    async seedDefaultQuotas(): Promise<void> {
        this.logger.log('Starting premium quota seeding...');

        try {
            // Clear existing default quotas (optional, for fresh seed)
            // await this.quotaModel.deleteMany({});

            for (const [plan, quotas] of Object.entries(this.DEFAULT_QUOTAS)) {
                for (const [quotaType, config] of Object.entries(quotas)) {
                    const existingQuota = await this.quotaModel.findOne({
                        plan,
                        quotaType,
                        isDefault: true,
                    });

                    if (existingQuota) {
                        this.logger.log(`Quota ${quotaType} for ${plan} already exists, skipping...`);
                        continue;
                    }

                    await this.quotaModel.create({
                        plan,
                        quotaType,
                        total: config.total,
                        used: 0,
                        remaining: config.total === -1 ? -1 : config.total,
                        period: config.period,
                        isDefault: true,
                        resetDate: this.calculateNextResetDate(config.period),
                    });

                    this.logger.log(`✓ Seeded quota ${quotaType} for ${plan}`);
                }
            }

            this.logger.log('Premium quota seeding completed successfully!');
        } catch (error) {
            this.logger.error('Error seeding premium quotas:', error);
            throw error;
        }
    }

    /**
     * Calculate next reset date based on period
     */
    private calculateNextResetDate(period: string): Date {
        const now = new Date();

        switch (period) {
            case 'monthly':
                return new Date(now.getFullYear(), now.getMonth() + 1, 1);
            case 'yearly':
                return new Date(now.getFullYear() + 1, 0, 1);
            case 'unlimited':
                return new Date('2099-12-31');
            default:
                return new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }
    }

    /**
     * Verify seeded quotas
     */
    async verifySeededQuotas(): Promise<void> {
        this.logger.log('Verifying seeded quotas...');

        const totalQuotas = await this.quotaModel.countDocuments({ isDefault: true });
        const expectedQuotas = Object.values(this.DEFAULT_QUOTAS).reduce(
            (sum, quotas) => sum + Object.keys(quotas).length,
            0,
        );

        if (totalQuotas === expectedQuotas) {
            this.logger.log(`✓ Verification passed: ${totalQuotas}/${expectedQuotas} quotas seeded`);
        } else {
            this.logger.warn(
                `⚠ Verification warning: ${totalQuotas}/${expectedQuotas} quotas found`,
            );
        }
    }
}

// Standalone seed script
async function runSeed() {
    const { NestFactory } = require('@nestjs/core');
    const { AppModule } = require('./app.module');

    const app = await NestFactory.createApplicationContext(AppModule);
    const seedService = app.get(PremiumQuotaSeedService);

    try {
        await seedService.seedDefaultQuotas();
        await seedService.verifySeededQuotas();
        console.log('✓ Seed completed successfully');
    } catch (error) {
        console.error('✗ Seed failed:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

// Run if executed directly
if (require.main === module) {
    runSeed();
}

export default PremiumQuotaSeedService;
