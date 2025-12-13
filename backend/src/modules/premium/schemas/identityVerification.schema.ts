import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type IdentityVerificationDocument = IdentityVerification & Document;

export enum VerificationStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
}

export enum DocumentType {
    ID_CARD = 'id_card',
    PASSPORT = 'passport',
    DRIVERS_LICENSE = 'drivers_license',
}

@Schema({ timestamps: true })
export class IdentityVerification {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: VerificationStatus, default: VerificationStatus.PENDING })
    status!: VerificationStatus;

    @Prop({ required: true, enum: DocumentType })
    documentType!: DocumentType;

    @Prop({ required: true })
    documentUrl!: string;

    @Prop()
    documentBackUrl?: string;

    @Prop({ type: Object })
    extractedData?: {
        fullName?: string;
        documentNumber?: string;
        dateOfBirth?: string;
        expiryDate?: string;
        nationality?: string;
        address?: string;
    };

    @Prop({ required: true })
    submittedAt!: Date;

    @Prop()
    reviewedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    reviewedBy?: Types.ObjectId;

    @Prop()
    rejectionReason?: string;

    @Prop({ type: Object })
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
        ocrConfidence?: number;
        manualReview?: boolean;
    };

    @Prop({ type: [String], default: [] })
    verificationFlags?: string[];
}

export const IdentityVerificationSchema = SchemaFactory.createForClass(IdentityVerification);

// Indexes
IdentityVerificationSchema.index({ status: 1, submittedAt: -1 });
IdentityVerificationSchema.index({ userId: 1 }, { unique: true });
