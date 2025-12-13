import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IdentityVerificationService } from './services/identity-verification.service';
import { SubmitVerificationDto, ReviewVerificationDto } from './dto/identity-verification.dto';

@Controller('identity-verification')
@UseGuards(JwtAuthGuard)
export class IdentityVerificationController {
    constructor(
        private readonly verificationService: IdentityVerificationService,
    ) { }

    /**
     * Upload identity document
     */
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDocument(@UploadedFile() file: Express.Multer.File) {
        const result = await this.verificationService.uploadDocument(file);
        return result;
    }

    /**
     * Submit verification request
     */
    @Post('submit')
    async submitVerification(
        @Request() req: any,
        @Body() dto: SubmitVerificationDto,
    ) {
        const verification = await this.verificationService.submitVerification(
            req.user.userId,
            dto,
            {
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            },
        );
        return { verification };
    }

    /**
     * Get my verification status
     */
    @Get('status')
    async getMyStatus(@Request() req: any) {
        const verification = await this.verificationService.getUserVerification(
            req.user.userId,
        );
        return { verification };
    }

    /**
     * Check if user is verified
     */
    @Get('check/:userId')
    async checkUserVerified(@Param('userId') userId: string) {
        const isVerified = await this.verificationService.isUserVerified(userId);
        return { verified: isVerified };
    }

    /**
     * Get pending verifications (admin only)
     */
    @Get('admin/pending')
    async getPendingVerifications() {
        const verifications = await this.verificationService.getPendingVerifications();
        return { verifications };
    }

    /**
     * Review verification (admin only)
     */
    @Put('admin/review/:id')
    async reviewVerification(
        @Request() req: any,
        @Param('id') id: string,
        @Body() dto: ReviewVerificationDto,
    ) {
        const verification = await this.verificationService.reviewVerification(
            id,
            req.user.userId,
            dto,
        );
        return { verification };
    }

    /**
     * Get verification statistics (admin only)
     */
    @Get('admin/stats')
    async getStats() {
        const stats = await this.verificationService.getVerificationStats();
        return { stats };
    }
}
