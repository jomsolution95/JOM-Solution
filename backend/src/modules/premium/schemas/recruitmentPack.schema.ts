import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecruitmentPackDocument = RecruitmentPack & Document;

export enum PackSize {
    SMALL = 5,
    MEDIUM = 10,
    LARGE = 20,
}

export enum PackStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    DEPLETED = 'depleted',
}

@Schema({ timestamps: true })
export class RecruitmentPack {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    companyId!: Types.ObjectId;

    @Prop({ required: true, enum: PackSize })
    packSize!: PackSize;

    @Prop({ required: true })
    totalCredits!: number;

    @Prop({ required: true, default: 0 })
    usedCredits!: number;

    @Prop({ required: true })
    remainingCredits!: number;

    @Prop({ required: true })
    price!: number;

    @Prop({ required: true })
    currency!: string;

    @Prop({ required: true })
    purchaseDate!: Date;

    @Prop()
    expiryDate?: Date;

    @Prop({ required: true, enum: PackStatus, default: PackStatus.ACTIVE })
    status!: PackStatus;

    @Prop({ type: String, required: true })
    paymentMethod!: string;

    @Prop({ type: String })
    transactionId?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Job' }], default: [] })
    jobsCreated!: Types.ObjectId[];

    @Prop({ type: Object })
    metadata?: {
        purchasedBy?: string;
        invoiceNumber?: string;
        notes?: string;
    };
}

export const RecruitmentPackSchema = SchemaFactory.createForClass(RecruitmentPack);

// Indexes
RecruitmentPackSchema.index({ companyId: 1, status: 1 });
RecruitmentPackSchema.index({ expiryDate: 1 });

// Methods
RecruitmentPackSchema.methods.consumeCredit = function (jobId: Types.ObjectId) {
    if (this.remainingCredits <= 0) {
        throw new Error('No credits remaining');
    }

    this.usedCredits += 1;
    this.remainingCredits -= 1;
    this.jobsCreated.push(jobId);

    if (this.remainingCredits === 0) {
        this.status = PackStatus.DEPLETED;
    }

    return this.save();
};

RecruitmentPackSchema.methods.isValid = function (): boolean {
    if (this.status !== PackStatus.ACTIVE) {
        return false;
    }

    if (this.remainingCredits <= 0) {
        return false;
    }

    if (this.expiryDate && new Date() > this.expiryDate) {
        this.status = PackStatus.EXPIRED;
        this.save();
        return false;
    }

    return true;
};
