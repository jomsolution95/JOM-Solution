import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { AdCampaign, AdCampaignSchema } from './schemas/adCampaign.schema';
import { AdImpression, AdImpressionSchema } from './schemas/adImpression.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AdCampaign.name, schema: AdCampaignSchema },
            { name: AdImpression.name, schema: AdImpressionSchema },
        ]),
        AuthModule,
    ],
    controllers: [AdsController],
    providers: [AdsService],
    exports: [AdsService],
})
export class AdsModule { }
