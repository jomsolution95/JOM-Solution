import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../src/modules/users/schemas/user.schema';
import { Subscription } from '../src/modules/premium/schemas/subscription.schema';
import { PremiumQuota } from '../src/modules/premium/schemas/premiumQuotas.schema';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userModel = app.get<Model<any>>(getModelToken(User.name));
    const subModel = app.get<Model<any>>(getModelToken(Subscription.name));
    const quotaModel = app.get<Model<any>>(getModelToken(PremiumQuota.name));

    const email = 'rectoversocompte@gmail.com';
    const user = await userModel.findOne({ email });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log('User ID:', user._id);

    const subs = await subModel.find({ userId: user._id });
    console.log('Subscriptions:', JSON.stringify(subs, null, 2));

    const quotas = await quotaModel.find({ userId: user._id });
    console.log('Quotas:', JSON.stringify(quotas, null, 2));

    await app.close();
}

bootstrap();
