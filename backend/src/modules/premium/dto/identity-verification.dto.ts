import { IsEnum, IsString, IsOptional } from 'class-validator';
import { DocumentType } from '../schemas/identityVerification.schema';

export class SubmitVerificationDto {
    @IsEnum(DocumentType)
    documentType!: DocumentType;

    @IsString()
    documentUrl!: string;

    @IsOptional()
    @IsString()
    documentBackUrl?: string;
}

export class ReviewVerificationDto {
    @IsEnum(['verified', 'rejected'])
    status!: 'verified' | 'rejected';

    @IsOptional()
    @IsString()
    rejectionReason?: string;
}
