import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CertificateDocument = Certificate & Document;

export enum CertificateStatus {
    ISSUED = 'issued',
    REVOKED = 'revoked',
    EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class Certificate {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    studentId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Training', required: true })
    courseId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    institutionId?: Types.ObjectId;

    @Prop({ required: true, unique: true })
    certificateNumber!: string;

    @Prop({ required: true })
    verificationCode!: string;

    @Prop({ required: true })
    pdfUrl!: string;

    @Prop({ required: true, default: () => new Date() })
    issuedDate!: Date;

    @Prop()
    expiryDate?: Date;

    @Prop({ required: true, enum: Object.values(CertificateStatus), default: CertificateStatus.ISSUED })
    status!: CertificateStatus;

    // Retaining some original fields if useful or mapped
    @Prop()
    blockchainHash?: string;

    @Prop()
    blockchainNetwork?: string;

    @Prop({ type: Object })
    metadata?: {
        courseName?: string;
        studentName?: string;
        completionDate?: Date;
        grade?: string;
        score?: number;
        duration?: string;
        skills?: string[];
        instructors?: string[];
    };
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);

// Indexes
CertificateSchema.index({ studentId: 1, issuedDate: -1 });
CertificateSchema.index({ courseId: 1 });
CertificateSchema.index({ certificateNumber: 1 }, { unique: true });
CertificateSchema.index({ verificationCode: 1 }, { unique: true });
CertificateSchema.index({ status: 1 });
