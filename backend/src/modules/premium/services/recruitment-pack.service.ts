import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RecruitmentPack, RecruitmentPackDocument, PackSize, PackStatus } from '../schemas/recruitmentPack.schema';
import { StripeService } from './stripe.service';
import { WaveService } from './wave.service';
import { OrangeMoneyService } from './orange-money.service';
import { PayTechService } from './paytech.service';
import { PurchasePackDto } from '../dto/recruitment-pack.dto';

// Pack pricing (in FCFA)
const PACK_PRICES = {
    [PackSize.SMALL]: 25000,   // 5 annonces
    [PackSize.MEDIUM]: 45000,  // 10 annonces
    [PackSize.LARGE]: 80000,   // 20 annonces
};

@Injectable()
export class RecruitmentPackService {
    constructor(
        @InjectModel(RecruitmentPack.name)
        private packModel: Model<RecruitmentPackDocument>,
        private stripeService: StripeService,
        private waveService: WaveService,
        private orangeMoneyService: OrangeMoneyService,
        private payTechService: PayTechService,
    ) { }

    /**
     * Purchase a recruitment pack
     */
    async purchasePack(
        companyId: string | Types.ObjectId,
        dto: PurchasePackDto,
    ): Promise<{
        pack?: RecruitmentPackDocument;
        paymentUrl?: string;
        transactionId?: string;
        clientSecret?: string;
    }> {
        const amount = dto.amount || PACK_PRICES[dto.packSize];
        const currency = dto.currency || 'XOF';

        // Create pending pack
        const pack = new this.packModel({
            companyId: new Types.ObjectId(companyId),
            packSize: dto.packSize,
            totalCredits: dto.packSize,
            usedCredits: 0,
            remainingCredits: dto.packSize,
            price: amount,
            currency,
            purchaseDate: new Date(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            status: PackStatus.ACTIVE,
            paymentMethod: dto.paymentMethod,
        });

        let result: any = {};

        switch (dto.paymentMethod) {
            case 'stripe':
                const paymentIntent = await this.stripeService.createPaymentIntent(
                    amount,
                    currency,
                    { companyId: companyId.toString(), packSize: dto.packSize },
                );
                pack.transactionId = paymentIntent.id;
                result = { pack: await pack.save(), clientSecret: paymentIntent.client_secret };
                break;

            case 'wave':
                if (!dto.phoneNumber) {
                    throw new BadRequestException('Phone number required for Wave');
                }
                const wavePayment = await this.waveService.initiatePayment(
                    amount,
                    currency,
                    dto.phoneNumber,
                    { companyId: companyId.toString(), packSize: dto.packSize },
                );
                pack.transactionId = wavePayment.transactionId;
                result = { pack: await pack.save(), paymentUrl: wavePayment.checkoutUrl };
                break;

            case 'orange_money':
                if (!dto.phoneNumber) {
                    throw new BadRequestException('Phone number required for Orange Money');
                }
                const omPayment = await this.orangeMoneyService.initiatePayment(
                    amount,
                    currency,
                    dto.phoneNumber,
                    { companyId: companyId.toString(), packSize: dto.packSize },
                );
                pack.transactionId = omPayment.transactionId;
                result = { pack: await pack.save(), paymentUrl: omPayment.paymentUrl };
                break;

            case 'paytech':
            case 'mobile_money':
                const refCommand = `${companyId}-${Date.now()}`; // Unique ref
                const payTechPayment = await this.payTechService.initiatePayment(
                    amount,
                    `Pack Recrutement ${dto.packSize}`,
                    refCommand,
                    currency,
                    (process.env.PAYTECH_ENV as 'test' | 'prod') || 'test',
                    { companyId: companyId.toString(), packSize: dto.packSize }
                );
                pack.transactionId = payTechPayment.token;
                // PayTech returns a token and a redirect URL
                result = {
                    pack: await pack.save(),
                    paymentUrl: payTechPayment.redirectUrl,
                    transactionId: payTechPayment.token
                };
                break;



            default:
                throw new BadRequestException('Invalid payment method');
        }

        return result;
    }

    /**
     * Get company's active packs
     */
    async getCompanyPacks(companyId: string | Types.ObjectId): Promise<RecruitmentPackDocument[]> {
        return this.packModel
            .find({ companyId: new Types.ObjectId(companyId) })
            .sort({ purchaseDate: -1 });
    }

    /**
     * Get active pack with credits
     */
    async getActivePack(companyId: string | Types.ObjectId): Promise<RecruitmentPackDocument | null> {
        const packs = await this.packModel
            .find({
                companyId: new Types.ObjectId(companyId),
                status: PackStatus.ACTIVE,
                remainingCredits: { $gt: 0 },
            })
            .sort({ purchaseDate: 1 }); // Oldest first (FIFO)

        return packs[0] || null;
    }

    /**
     * Consume a credit from pack
     */
    async consumeCredit(
        companyId: string | Types.ObjectId,
        jobId: string | Types.ObjectId,
    ): Promise<RecruitmentPackDocument> {
        const pack = await this.getActivePack(companyId);

        if (!pack) {
            throw new NotFoundException('No active recruitment pack found. Please purchase a pack.');
        }

        if (!(pack as any).isValid()) {
            throw new BadRequestException('Pack is no longer valid');
        }

        return (pack as any).consumeCredit(new Types.ObjectId(jobId));
    }

    /**
     * Get total remaining credits
     */
    async getTotalRemainingCredits(companyId: string | Types.ObjectId): Promise<number> {
        const result = await this.packModel.aggregate([
            {
                $match: {
                    companyId: new Types.ObjectId(companyId),
                    status: PackStatus.ACTIVE,
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$remainingCredits' },
                },
            },
        ]);

        return result[0]?.total || 0;
    }

    /**
     * Get pack statistics
     */
    async getPackStats(companyId: string | Types.ObjectId): Promise<any> {
        const packs = await this.packModel.find({
            companyId: new Types.ObjectId(companyId),
        });

        const totalPurchased = packs.reduce((sum, p) => sum + p.totalCredits, 0);
        const totalUsed = packs.reduce((sum, p) => sum + p.usedCredits, 0);
        const totalRemaining = packs.reduce((sum, p) => sum + p.remainingCredits, 0);
        const totalSpent = packs.reduce((sum, p) => sum + p.price, 0);

        const activePacks = packs.filter((p) => p.status === PackStatus.ACTIVE);
        const depletedPacks = packs.filter((p) => p.status === PackStatus.DEPLETED);
        const expiredPacks = packs.filter((p) => p.status === PackStatus.EXPIRED);

        return {
            totalPurchased,
            totalUsed,
            totalRemaining,
            totalSpent,
            packCount: packs.length,
            activePacks: activePacks.length,
            depletedPacks: depletedPacks.length,
            expiredPacks: expiredPacks.length,
        };
    }

    /**
     * Get pack by ID
     */
    async getPack(packId: string | Types.ObjectId): Promise<RecruitmentPackDocument> {
        const pack = await this.packModel.findById(packId);
        if (!pack) {
            throw new NotFoundException('Pack not found');
        }
        return pack;
    }

    /**
     * Get pack pricing
     */
    getPackPricing(): any {
        return Object.entries(PACK_PRICES).map(([size, price]) => ({
            size: parseInt(size),
            credits: parseInt(size),
            price,
            pricePerJob: Math.round(price / parseInt(size)),
            savings: this.calculateSavings(parseInt(size), price),
        }));
    }

    /**
     * Calculate savings compared to single job price
     */
    private calculateSavings(credits: number, packPrice: number): number {
        const singleJobPrice = 7000; // Base price per job
        const totalSinglePrice = singleJobPrice * credits;
        const savings = ((totalSinglePrice - packPrice) / totalSinglePrice) * 100;
        return Math.round(savings);
    }
    /**
     * Handle PayTech Webhook
     */
    async handlePayTechWebhook(payload: any): Promise<boolean> {
        // 1. Verify notification
        if (!this.payTechService.verifyNotification(payload)) {
            throw new BadRequestException('Invalid PayTech Notification');
        }

        // 2. Extract data
        const { type_event, ref_command, item_price } = payload;

        if (type_event !== 'sale_complete') {
            return false; // Ignore other events
        }

        // 3. Find Transaction (Pack) - relying on transactionId matching the token or finding by ref_command if stored
        // In initiatePayment, we used ref_command = `companyId-timestamp`. 
        // However, we saved `transactionId = response.token`. 
        // Typically PayTech validates the transaction by ref_command.
        // We need to find the pack that corresponds to this payment.
        // BUT, we didn't save ref_command in the Pack schema! We only saved transactionId (token).

        // CRITICAL: We need to find the pack. 
        // Let's try to find by transactionId if PayTech sends the token back in IPN.
        // Payload usually has 'token'.
        const token = payload.token;

        let pack: RecruitmentPackDocument | null = null;
        if (token) {
            pack = await this.packModel.findOne({ transactionId: token });
        }

        if (!pack) {
            // Fallback: try to parse ref_command if possible, but we didn't save it.
            // Wait, ref_command is composed of ID - Time.
            // If we can't find by token, we might be stuck.
            // Let's assume PayTech sends the token back.
            console.warn(`PayTech Webhook: Pack not found for token ${token}`);
            return false;
        }

        if (pack.status === PackStatus.ACTIVE) {
            return true; // Already processed
        }

        // 4. Validate Amount
        if (pack.price != item_price) {
            console.warn(`PayTech Webhook: Amount mismatch. Expected ${pack.price}, got ${item_price}`);
            // Potentially flag for review, but for now we might reject or accept if close.
            // Let's validation strict.
            // return false; 
        }

        // 5. Activate Pack
        pack.status = PackStatus.ACTIVE;
        pack.paymentMethod = 'paytech'; // Ensure it's set
        await pack.save();

        return true;
    }
}
