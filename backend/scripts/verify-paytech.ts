import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import * as crypto from 'crypto';
import { RecruitmentPackService } from '../src/modules/premium/services/recruitment-pack.service';
import { PayTechService } from '../src/modules/premium/services/paytech.service';
import { RecruitmentPack, RecruitmentPackSchema, PackSize } from '../src/modules/premium/schemas/recruitmentPack.schema';
import { StripeService } from '../src/modules/premium/services/stripe.service';
import { WaveService } from '../src/modules/premium/services/wave.service';
import { OrangeMoneyService } from '../src/modules/premium/services/orange-money.service';

// Mock other services
const mockService = {};

async function verifyPayTechFlow() {
    console.log('🚀 Starting Isolated PayTech Verification Flow...');

    const moduleRef = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env.development',
            }),
            MongooseModule.forRootAsync({
                imports: [ConfigModule],
                useFactory: async (configService: ConfigService) => ({
                    uri: configService.get<string>('MONGODB_URI'),
                }),
                inject: [ConfigService],
            }),
            MongooseModule.forFeature([
                { name: RecruitmentPack.name, schema: RecruitmentPackSchema },
            ]),
        ],
        providers: [
            RecruitmentPackService,
            PayTechService,
            { provide: StripeService, useValue: mockService },
            { provide: WaveService, useValue: mockService },
            { provide: OrangeMoneyService, useValue: mockService },
        ],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    const packService = moduleRef.get<RecruitmentPackService>(RecruitmentPackService);
    const configService = moduleRef.get<ConfigService>(ConfigService);

    // 1. Setup Test Data
    const COMPANY_ID = new Types.ObjectId();
    const PACK_SIZE = PackSize.SMALL;

    console.log(`\n📋 Test Configuration:`);
    console.log(`   Company ID: ${COMPANY_ID}`);
    console.log(`   Pack Size: ${PACK_SIZE}`);
    console.log(`   API Key Configured: ${!!configService.get('PAYTECH_API_KEY')}`);

    if (!configService.get('PAYTECH_API_KEY')) {
        console.error('❌ PAYTECH_API_KEY is missing in env!');
        process.exit(1);
    }

    try {
        // 2. Initiate Payment
        console.log('\n💳 Step 1: Initiating Payment...');
        try {
            const purchaseResult = await packService.purchasePack(
                COMPANY_ID.toString(),
                {
                    packSize: PACK_SIZE,
                    paymentMethod: 'paytech',
                    amount: 25000,
                    currency: 'XOF',
                }
            );

            console.log('   ✅ Payment Initiated!');
            console.log(`   Token: ${purchaseResult.transactionId}`);
            console.log(`   Redirect URL: ${purchaseResult.paymentUrl}`);

            if (!purchaseResult.transactionId) {
                throw new Error('No transaction ID returned.');
            }

            // 3. Simulate IPN Callback
            console.log('\nwebhook Step 2: Simulating IPN Callback...');

            const apiKey = configService.get<string>('PAYTECH_API_KEY') || '';
            const apiSecret = configService.get<string>('PAYTECH_API_SECRET') || '';

            const payload = {
                type_event: 'sale_complete',
                item_price: 25000,
                currency: 'XOF',
                ref_command: 'unknown-ref',
                item_name: `Pack Recrutement ${PACK_SIZE}`,
                command_name: `Pack Recrutement ${PACK_SIZE}`,
                env: 'test',
                token: purchaseResult.transactionId,
                api_key_sha256: crypto.createHash('sha256').update(apiKey).digest('hex'),
                api_secret_sha256: crypto.createHash('sha256').update(apiSecret).digest('hex'),
            };

            const success = await packService.handlePayTechWebhook(payload);

            if (success) {
                console.log('   ✅ IPN Processed Successfully!');
            } else {
                console.error('   ❌ IPN Processing Failed.');
            }

            // 4. Verify Active Status
            console.log('\n🔍 Step 3: Verifying Pack Status...');
            const activePack = await packService.getActivePack(COMPANY_ID.toString());

            if (activePack && activePack.transactionId === purchaseResult.transactionId) {
                console.log('   ✅ Pack is ACTIVE in Database!');
                console.log(`   Stats: ${activePack.remainingCredits} credits remaining.`);
            } else {
                console.error('   ❌ Pack verification failed. Pack not found or not active.');
            }

        } catch (innerError: any) {
            console.error('   ❌ Action Failed:', innerError.message);
            if (innerError.response) {
                console.error('   API Response:', innerError.response.data);
            }
            throw innerError;
        }

    } catch (error) {
        console.error('\n❌ Verification Failed.');
        // Don't exit 1 to allow logs to be read easily if captured
    } finally {
        await app.close();
        process.exit(0);
    }
}

// Run
verifyPayTechFlow();
