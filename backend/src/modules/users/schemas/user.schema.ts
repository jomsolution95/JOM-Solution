import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

    @Prop({ select: false })
    resetPasswordToken?: string;

    @Prop({ select: false })
    resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);


