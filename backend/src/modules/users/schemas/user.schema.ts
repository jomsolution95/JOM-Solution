import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
    INDIVIDUAL = 'individual',
    COMPANY = 'company',
    ETABLISSEMENT = 'etablissement',
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin',
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email!: string;

    @Prop({ required: false })
    name?: string;

    @Prop({ required: false })
    phone?: string;

    @Prop({ required: false })
    avatar?: string;

    @Prop({ required: true, select: false })
    passwordHash!: string;

    @Prop({ type: [String], enum: UserRole, default: [UserRole.INDIVIDUAL] })
    roles!: UserRole[];

    @Prop({ default: false })
    isVerified!: boolean;

    @Prop({ default: true })
    isActive!: boolean;

    @Prop({ select: false })
    refreshTokenHash?: string;

    @Prop({ select: false })
    twoFactorSecret?: string;

    @Prop({ default: false })
    isTwoFactorEnabled!: boolean;

    @Prop()
    lastLogin?: Date;

    @Prop({ default: null })
    deletedAt?: Date;

    @Prop({ required: false })
    provider?: string; // 'google', 'facebook', 'linkedin'

    @Prop({ required: false })
    providerId?: string;

    // --- KYC Fields ---
    @Prop({ enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'], default: 'NONE' })
    kycStatus!: string;

    @Prop({ type: [String], default: [] })
    kycDocuments?: string[];

    @Prop({ required: false })
    kycRejectionReason?: string;

    @Prop({ type: Object, default: {} })
    socialLinks?: {
        linkedin?: string;
        github?: string;
        twitter?: string;
        website?: string;
    };

    @Prop(raw({
        privacy: {
            profileVisibility: { type: String, enum: ['public', 'connected', 'private'], default: 'public' },
            showEmail: { type: Boolean, default: false },
            showPhone: { type: Boolean, default: false },
            ghostMode: { type: Boolean, default: false },
            blockedUsers: [{ type: String }]
        },
        communications: {
            messagePermission: { type: String, enum: ['everyone', 'connections', 'none'], default: 'everyone' }
        },
        notifications: {
            email: { type: Object, default: { messages: true, jobs: true, news: true } },
            push: { type: Object, default: { messages: true, jobs: true } }
        }
    }))
    settings?: {
        privacy?: {
            profileVisibility?: string;
            showEmail?: boolean;
            showPhone?: boolean;
            ghostMode?: boolean;
            blockedUsers?: string[];
        };
        communications?: {
            messagePermission?: string;
        };
        notifications?: {
            email?: { messages?: boolean; jobs?: boolean; news?: boolean };
            push?: { messages?: boolean; jobs?: boolean };
        };
    };

    @Prop({ select: false })
    resetPasswordToken?: string;

    @Prop({ select: false })
    resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);


