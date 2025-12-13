import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IdentityVerification, IdentityVerificationDocument, VerificationStatus } from '../schemas/identityVerification.schema';
import { OCRService } from './ocr.service';
import { FileUploadService } from './file-upload.service';
import { SubmitVerificationDto, ReviewVerificationDto } from '../dto/identity-verification.dto';

@Injectable()
export class IdentityVerificationService {
    constructor(
        @InjectModel(IdentityVerification.name)
        private verificationModel: Model<IdentityVerificationDocument>,
        private ocrService: OCRService,
        private fileUploadService: FileUploadService,
    ) { }

    /**
     * Submit identity verification
     */
    async submitVerification(
        userId: string | Types.ObjectId,
        dto: SubmitVerificationDto,
        metadata?: any,
    ): Promise<IdentityVerificationDocument> {
        // Check if user already has a verification
        const existing = await this.verificationModel.findOne({
            userId: new Types.ObjectId(userId),
        });

        if (existing && existing.status === VerificationStatus.VERIFIED) {
            throw new ConflictException('User is already verified');
        }

        if (existing && existing.status === VerificationStatus.PENDING) {
            throw new ConflictException('Verification request already pending');
        }

        // Perform OCR on document
        const ocrResult = await this.ocrService.extractTextFromDocument(dto.documentUrl);

        // Validate extracted data
        const validation = this.ocrService.validateExtractedData(
            ocrResult.extractedData,
            ocrResult.confidence,
        );

        // Create or update verification
        const verification = existing || new this.verificationModel();

        verification.userId = new Types.ObjectId(userId);
        verification.status = VerificationStatus.PENDING;
        verification.documentType = dto.documentType;
        verification.documentUrl = dto.documentUrl;
        verification.documentBackUrl = dto.documentBackUrl;
        verification.extractedData = ocrResult.extractedData;
        verification.submittedAt = new Date();
        verification.verificationFlags = validation.flags;
        verification.metadata = {
            ...metadata,
            ocrConfidence: ocrResult.confidence,
            manualReview: !validation.isValid || ocrResult.confidence < 80,
        };

        return await verification.save();
    }

    /**
     * Upload identity document
     */
    async uploadDocument(file: Express.Multer.File): Promise<{ url: string; key: string }> {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid file type. Only JPEG, PNG, and PDF allowed');
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('File too large. Maximum size: 10MB');
        }

        return this.fileUploadService.uploadFile(file, 'identity-documents');
    }

    /**
     * Get user's verification status
     */
    async getUserVerification(
        userId: string | Types.ObjectId,
    ): Promise<IdentityVerificationDocument | null> {
        return this.verificationModel.findOne({
            userId: new Types.ObjectId(userId),
        });
    }

    /**
     * Get pending verifications for admin review
     */
    async getPendingVerifications(): Promise<IdentityVerificationDocument[]> {
        return this.verificationModel
            .find({ status: VerificationStatus.PENDING })
            .populate('userId', 'name email avatar')
            .sort({ submittedAt: 1 }); // Oldest first
    }

    /**
     * Review verification (admin)
     */
    async reviewVerification(
        verificationId: string | Types.ObjectId,
        adminId: string | Types.ObjectId,
        dto: ReviewVerificationDto,
    ): Promise<IdentityVerificationDocument> {
        const verification = await this.verificationModel.findById(verificationId);

        if (!verification) {
            throw new NotFoundException('Verification not found');
        }

        if (verification.status !== VerificationStatus.PENDING) {
            throw new BadRequestException('Verification already reviewed');
        }

        verification.status = dto.status as VerificationStatus;
        verification.reviewedAt = new Date();
        verification.reviewedBy = new Types.ObjectId(adminId);

        if (dto.status === 'rejected') {
            verification.rejectionReason = dto.rejectionReason;
        }

        await verification.save();

        // Update user's verified status
        if (dto.status === 'verified') {
            await this.updateUserVerifiedStatus(verification.userId, true);
        }

        return verification;
    }

    /**
     * Update user's verified badge
     */
    private async updateUserVerifiedStatus(
        userId: Types.ObjectId,
        verified: boolean,
    ): Promise<void> {
        // This should update the User model
        // await this.userModel.findByIdAndUpdate(userId, { verified });
    }

    /**
     * Get verification statistics
     */
    async getVerificationStats(): Promise<any> {
        const total = await this.verificationModel.countDocuments();
        const pending = await this.verificationModel.countDocuments({
            status: VerificationStatus.PENDING,
        });
        const verified = await this.verificationModel.countDocuments({
            status: VerificationStatus.VERIFIED,
        });
        const rejected = await this.verificationModel.countDocuments({
            status: VerificationStatus.REJECTED,
        });

        return {
            total,
            pending,
            verified,
            rejected,
            verificationRate: total > 0 ? (verified / total) * 100 : 0,
        };
    }

    /**
     * Check if user is verified
     */
    async isUserVerified(userId: string | Types.ObjectId): Promise<boolean> {
        const verification = await this.verificationModel.findOne({
            userId: new Types.ObjectId(userId),
            status: VerificationStatus.VERIFIED,
        });

        return !!verification;
    }
}
