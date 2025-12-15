
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../src/modules/users/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('SeedSuperAdmin');
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

        const superAdminEmail = 'jomsolution95@gmail.com';
        const password = 'AlhamdulilLah95'; // Provided by user

        // Check if exists
        const existing = await userModel.findOne({ email: superAdminEmail });
        if (existing) {
            logger.warn(`Super Admin ${superAdminEmail} already exists. Updating credentials & roles...`);

            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(password, salt);

            existing.passwordHash = passwordHash;

            // Optional: Update roles if needed to ensure he has SUPER_ADMIN
            if (!existing.roles.includes(UserRole.SUPER_ADMIN)) {
                existing.roles.push(UserRole.SUPER_ADMIN);
            }

            await existing.save();
            logger.log('✅ Super Admin credentials updated successfully!');
            return;
        }

        logger.log(`Creating Super Admin: ${superAdminEmail}...`);

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newAdmin = new userModel({
            email: superAdminEmail,
            passwordHash: passwordHash,
            roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INDIVIDUAL], // All powers + user features
            isVerified: true,
            isActive: true,
            phone: '+221000000000', // Placeholder
        });

        await newAdmin.save();
        logger.log('✅ Super Admin created successfully!');

    } catch (error) {
        logger.error('Failed to seed Super Admin', error);
    } finally {
        await app.close();
    }
}

bootstrap();
