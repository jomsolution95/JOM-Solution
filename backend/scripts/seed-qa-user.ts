
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/modules/users/schemas/user.schema';
// @ts-ignore
const bcrypt = require('bcrypt');
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('SeedQAUser');
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

        const email = 'qa@jom.com';
        const password = 'Quality123!';
        const targetRole = process.argv[2] || 'individual'; // Allow passing role as arg

        logger.log(`Checking for QA user: ${email}...`);
        const existing = await userModel.findOne({ email });

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        if (existing) {
            logger.warn(`QA User exists. Updating role to [${targetRole}]...`);
            existing.roles = [targetRole as any];
            existing.passwordHash = passwordHash;
            existing.isVerified = true;
            await existing.save();
        } else {
            logger.log(`Creating new QA User with role [${targetRole}]...`);
            const newUser = new userModel({
                email,
                passwordHash,
                name: 'QA Tester',
                roles: [targetRole as any],
                isVerified: true,
                isActive: true,
                avatar: 'https://ui-avatars.com/api/?name=QA+Tester&background=random',
            });
            await newUser.save();
        }

        logger.log(`✅ QA User ready: ${email} / ${password} [Role: ${targetRole}]`);

    } catch (error) {
        logger.error('Failed to seed QA User', error);
    } finally {
        await app.close();
    }
}

bootstrap();
