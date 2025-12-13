import {
    Controller,
    Get,
    Post,
    Param,
    UseGuards,
    Request,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CertificateService } from './services/certificate.service';

@Controller('certificates')
export class CertificateController {
    constructor(private readonly certificateService: CertificateService) { }

    /**
     * Generate certificate for completed course
     */
    @Post('generate/:courseId')
    @UseGuards(JwtAuthGuard)
    async generateCertificate(@Request() req: any, @Param('courseId') courseId: string) {
        const certificate = await this.certificateService.generateCertificate(
            req.user.userId,
            courseId,
        );
        return { certificate };
    }

    /**
     * Get user's certificates
     */
    @Get('my-certificates')
    @UseGuards(JwtAuthGuard)
    async getMyCertificates(@Request() req: any) {
        const certificates = await this.certificateService.getUserCertificates(req.user.userId);
        return { certificates };
    }

    /**
     * Get single certificate
     */
    @Get(':id')
    async getCertificate(@Param('id') id: string) {
        const certificate = await this.certificateService.getCertificate(id);
        return { certificate };
    }

    /**
     * Verify certificate by code
     */
    @Get('verify/:code')
    async verifyCertificate(@Param('code') code: string) {
        const certificate = await this.certificateService.verifyCertificate(code);
        if (!certificate) {
            return { valid: false, message: 'Certificate not found' };
        }
        return {
            valid: true,
            certificate: {
                studentName: (certificate.studentId as any).name,
                courseName: (certificate.courseId as any).title,
                issuedDate: certificate.issuedDate,
                certificateNumber: certificate.certificateNumber,
            },
        };
    }

    /**
     * Download certificate PDF
     */
    @Get(':id/download')
    @UseGuards(JwtAuthGuard)
    async downloadCertificate(@Param('id') id: string, @Res() res: Response) {
        const certificate = await this.certificateService.getCertificate(id);
        res.redirect(certificate.pdfUrl);
    }
}
