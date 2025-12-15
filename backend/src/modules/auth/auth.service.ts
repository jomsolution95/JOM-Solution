import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from '../premium/services/subscription.service';
import { SubscriptionPlan, SubscriptionStatus } from '../premium/schemas/subscription.schema';
import { UserRole } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
        private configService: ConfigService,
        private subscriptionService: SubscriptionService,
    ) { }

    async forceResetSuperAdmin() {
        const email = 'jomsolution95@gmail.com';
        const password = 'AlhamdulilLah95';
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);

        const updated = await this.userModel.findOneAndUpdate(
            { email },
            {
                passwordHash: hash,
                roles: ['SUPER_ADMIN', 'ADMIN', 'INDIVIDUAL'],
                isVerified: true
            },
            { new: true, upsert: true }
        );
        return { msg: 'SUCCESS: Password Reset Done.', user: updated.email };
    }


    async register(dto: RegisterDto) {
        const hash = await this.hashData(dto.password);
        const newUser = new this.userModel({
            email: dto.email,
            passwordHash: hash,
            roles: [dto.role], // Initial role
        });

        try {
            await newUser.save();

            // --- 30-DAY FREE TRIAL LOGIC ---
            let plan = SubscriptionPlan.INDIVIDUAL_PRO; // Default
            if (dto.role === UserRole.COMPANY) plan = SubscriptionPlan.COMPANY_BIZ;
            if (dto.role === UserRole.ETABLISSEMENT) plan = SubscriptionPlan.SCHOOL_EDU;

            try {
                await this.subscriptionService.createTrialSubscription(newUser._id.toString(), plan);
                console.log(`[TRIAL] Created 30-day trial (${plan}) for new user: ${newUser.email}`);
            } catch (trialError) {
                console.error('Failed to create trial subscription:', trialError);
                // Don't fail registration if trial fails, just log it.
            }
            // -------------------------------

            const tokens = await this.getTokens(newUser._id.toString(), newUser.email, newUser.roles);
            await this.updateRefreshTokenHash(newUser._id.toString(), tokens.refresh_token);
            return tokens;
        } catch (error: any) {
            if (error.code === 11000) throw new ForbiddenException('Credentials taken');
            throw error;
        }
    }

    async login(dto: LoginDto): Promise<{ access_token: string; refresh_token: string, user: any }> {
        const user = await this.userModel.findOne({ email: dto.email }).select('+passwordHash +roles');
        if (!user) throw new ForbiddenException('Access Denied');

        const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatches) throw new ForbiddenException('Access Denied');

        const tokens = await this.getTokens(user._id.toString(), user.email, user.roles);
        await this.updateRefreshTokenHash(user._id.toString(), tokens.refresh_token);

        // Return user info without sensitive data
        // Return user info without sensitive data
        const userObj = user.toObject();
        const { passwordHash, refreshTokenHash, ...safeUser } = userObj;

        return { ...tokens, user: safeUser };
    }

    async logout(userId: string) {
        await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: null });
    }

    async refreshTokens(userId: string, rt: string) {
        const user = await this.userModel.findById(userId).select('+refreshTokenHash +roles');
        if (!user || !user.refreshTokenHash) throw new ForbiddenException('Access Denied');

        const rtMatches = await bcrypt.compare(rt, user.refreshTokenHash);
        if (!rtMatches) throw new ForbiddenException('Access Denied');

        const tokens = await this.getTokens(user._id.toString(), user.email, user.roles);
        await this.updateRefreshTokenHash(user._id.toString(), tokens.refresh_token);
        return tokens;
    }

    async updateRefreshTokenHash(userId: string, rt: string) {
        const hash = await this.hashData(rt);
        await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash });
    }

    async getTokens(userId: string, email: string, roles: string[]) {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, email, roles },
                {
                    secret: this.configService.get<string>('JWT_SECRET'),
                    expiresIn: '15m',
                },
            ),
            this.jwtService.signAsync(
                { sub: userId, email, roles },
                {
                    secret: this.configService.get<string>('JWT_SECRET'),
                    expiresIn: '7d',
                },
            ),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }

    hashData(data: string) {
        return bcrypt.hash(data, 10);
    }

    async validateSocialLogin(profile: { email: string; firstName?: string; lastName?: string; provider: string; providerId: string }) {
        let user = await this.userModel.findOne({ email: profile.email });

        if (!user) {
            console.log(`Creating new user from ${profile.provider} login: ${profile.email}`);
            const hash = await this.hashData(Math.random().toString(36).slice(-8) + Date.now());
            user = new this.userModel({
                email: profile.email,
                passwordHash: hash, // Random password, user should user social login or reset password
                roles: ['individual'],
                isVerified: true, // Trusted from provider
                provider: profile.provider,
                providerId: profile.providerId
            });
            await user.save();

            // --- 30-DAY FREE TRIAL LOGIC (Social) ---
            // Defaulting to INDIVIDUAL_PRO for social login as we don't know role yet usually (defaults to individual)
            try {
                await this.subscriptionService.createTrialSubscription(user._id.toString(), SubscriptionPlan.INDIVIDUAL_PRO);
                console.log(`[TRIAL] Created 30-day trial (INDIVIDUAL_PRO) for new social user: ${user.email}`);
            } catch (trialError) {
                console.error('Failed to create trial subscription (Social):', trialError);
            }
            // ----------------------------------------
        } else {
            // Update provider info if not set
            if (!user.provider) {
                user.provider = profile.provider;
                user.providerId = profile.providerId;
                await user.save();
            }
        }

        const tokens = await this.getTokens(user._id.toString(), user.email, user.roles);
        await this.updateRefreshTokenHash(user._id.toString(), tokens.refresh_token);

        const userObj = user.toObject();
        const { passwordHash, refreshTokenHash, ...safeUser } = userObj;
        return { ...tokens, user: safeUser };
    }

    async forgotPassword(email: string) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            // Allow silence for security, or throw specific error based on policy
            // Here we silence to prevent enumeration, but for UX we might want to know (for now we return success fake)
            // But if user doesn't exist, we just return.
            return;
        }

        // Generate token
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetTokenHash = await this.hashData(resetToken);

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // Simulate Email
        const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&email=${user.email}`;
        console.log(`\n\n========================================================\nPASSWORD RESET REQUEST FOR: ${user.email}\nLINK: ${resetLink}\n========================================================\n\n`);

        // TODO: Integrate NotificationsService when email is configured
        // await this.notificationsService.sendEmail(user.email, 'Reset Password', resetLink);

        return { message: 'Reset link sent' };
    }

    async resetPassword(token: string, email: string, newPassword: string) {
        // Need to find user by email to get the hash, since we can't query by hash directly easily if salted differently every time (bcrypt)
        // Actually we stored the hash, so we need to verify it.
        // We find user by email and non-expired token existence
        const user = await this.userModel.findOne({
            email,
            resetPasswordExpires: { $gt: Date.now() },
            resetPasswordToken: { $exists: true }
        }).select('+resetPasswordToken');

        if (!user || !user.resetPasswordToken) throw new ForbiddenException('Invalid or expired token');

        const isMatch = await bcrypt.compare(token, user.resetPasswordToken);
        if (!isMatch) throw new ForbiddenException('Invalid or expired token');

        // Update password
        user.passwordHash = await this.hashData(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return { message: 'Password updated successfully' };
    }
}
