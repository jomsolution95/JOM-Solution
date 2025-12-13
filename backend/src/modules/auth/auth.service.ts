import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    ) { }

    async register(dto: RegisterDto) {
        const hash = await this.hashData(dto.password);
        const newUser = new this.userModel({
            email: dto.email,
            passwordHash: hash,
            roles: [dto.role], // Initial role
        });

        try {
            await newUser.save();
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
}
