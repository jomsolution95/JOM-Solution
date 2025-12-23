import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/modules/users/schemas/user.schema';
import { SubscriptionService } from '../src/modules/premium/services/subscription.service';
import { SubscriptionPlan } from '../src/modules/premium/schemas/subscription.schema';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    const subscriptionService = app.get(SubscriptionService);

    const targets = [
        { email: 'laye95gueye@gmail.com', plan: SubscriptionPlan.INDIVIDUAL_PRO },
        { email: 'rectoversocompte@gmail.com', plan: SubscriptionPlan.COMPANY_BIZ },
        { email: 'jooleubi@gmail.com', plan: SubscriptionPlan.SCHOOL_EDU },
    ];

    console.log('--- STARTING TRIAL GRANT SCRIPT ---');

    for (const target of targets) {
        try {
            const user = await userModel.findOne({ email: target.email });
            if (!user) {
                console.warn(`User not found: ${target.email}`);
                continue;
            }

            console.log(`Found user: ${target.email} (${user._id})`);

            await subscriptionService.createTrialSubscription(user._id.toString(), target.plan);
            console.log(`✅ Granted TRIAL (${target.plan}) to ${target.email}`);

        } catch (error) {
            console.error(`❌ Failed for ${target.email}:`, error);
        }
    }

    console.log('--- DONE ---');
    await app.close();
}

bootstrap();
