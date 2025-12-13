import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Certificate, CertificateDocument } from '../schemas/certificates.schema';
import { StudentProgress, StudentProgressDocument } from '../schemas/studentProgress.schema';
import { TrainingContent, TrainingContentDocument } from '../schemas/trainingContent.schema';
import { FileUploadService } from './file-upload.service';
const PDFDocument = require('pdfkit');
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CertificateService {
    constructor(
        @InjectModel(Certificate.name)
        private certificateModel: Model<CertificateDocument>,
        @InjectModel(StudentProgress.name)
        private progressModel: Model<StudentProgressDocument>,
        @InjectModel(TrainingContent.name)
        private courseModel: Model<TrainingContentDocument>,
        private fileUploadService: FileUploadService,
        private configService: ConfigService,
    ) { }

    /**
     * Generate certificate for completed course
     */
    async generateCertificate(
        studentId: string | Types.ObjectId,
        courseId: string | Types.ObjectId,
    ): Promise<CertificateDocument> {
        // Check if course is completed
        const progress = await this.progressModel
            .findOne({
                studentId: new Types.ObjectId(studentId),
                courseId: new Types.ObjectId(courseId),
            })
            .populate('studentId', 'name email')
            .populate('courseId');

        if (!progress) {
            throw new NotFoundException('Enrollment not found');
        }

        if (!progress.completed) {
            throw new NotFoundException('Course not completed yet');
        }

        // Check if certificate already exists
        const existing = await this.certificateModel.findOne({
            studentId: new Types.ObjectId(studentId),
            courseId: new Types.ObjectId(courseId),
        });

        if (existing) {
            return existing;
        }

        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Generate unique certificate ID
        const certificateId = new Types.ObjectId();
        const verificationCode = this.generateVerificationCode();

        // Generate QR code
        const verificationUrl = `${this.configService.get('APP_URL')}/certificates/verify/${verificationCode}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

        // Generate PDF
        const pdfBuffer = await this.generatePDF({
            studentName: (progress.studentId as any).name,
            courseName: course.title,
            completionDate: progress.completedAt || new Date(),
            verificationCode,
            qrCodeDataUrl,
        });

        // Upload to S3
        const uploadResult = await this.uploadCertificatePDF(pdfBuffer, certificateId.toString());

        // Create certificate record
        const certificate = new this.certificateModel({
            _id: certificateId,
            studentId: new Types.ObjectId(studentId),
            courseId: new Types.ObjectId(courseId),
            institutionId: course.institutionId,
            certificateNumber: this.generateCertificateNumber(),
            issuedDate: new Date(),
            verificationCode,
            pdfUrl: uploadResult.url,
            metadata: {
                courseName: course.title,
                studentName: (progress.studentId as any).name,
                completionDate: progress.completedAt,
                grade: this.calculateGrade(progress),
            },
        });

        return await certificate.save();
    }

    /**
     * Generate PDF certificate
     */
    private async generatePDF(data: {
        studentName: string;
        courseName: string;
        completionDate: Date;
        verificationCode: string;
        qrCodeDataUrl: string;
    }): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
            });

            const chunks: Buffer[] = [];
            doc.on('data', (chunk: any) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Background
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');

            // Border
            doc
                .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
                .lineWidth(3)
                .stroke('#3b82f6');

            doc
                .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
                .lineWidth(1)
                .stroke('#3b82f6');

            // Header
            doc
                .fontSize(40)
                .font('Helvetica-Bold')
                .fillColor('#1f2937')
                .text('CERTIFICAT DE RÉUSSITE', 0, 100, {
                    align: 'center',
                });

            // Decorative line
            doc
                .moveTo(200, 160)
                .lineTo(doc.page.width - 200, 160)
                .lineWidth(2)
                .stroke('#3b82f6');

            // Body
            doc
                .fontSize(16)
                .font('Helvetica')
                .fillColor('#6b7280')
                .text('Ce certificat atteste que', 0, 200, {
                    align: 'center',
                });

            doc
                .fontSize(32)
                .font('Helvetica-Bold')
                .fillColor('#1f2937')
                .text(data.studentName, 0, 240, {
                    align: 'center',
                });

            doc
                .fontSize(16)
                .font('Helvetica')
                .fillColor('#6b7280')
                .text('a complété avec succès le cours', 0, 290, {
                    align: 'center',
                });

            doc
                .fontSize(24)
                .font('Helvetica-Bold')
                .fillColor('#3b82f6')
                .text(data.courseName, 0, 330, {
                    align: 'center',
                });

            // Date
            const formattedDate = data.completionDate.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            doc
                .fontSize(14)
                .font('Helvetica')
                .fillColor('#6b7280')
                .text(`Délivré le ${formattedDate}`, 0, 400, {
                    align: 'center',
                });

            // QR Code
            const qrSize = 80;
            const qrX = doc.page.width - 150;
            const qrY = doc.page.height - 150;

            doc.image(data.qrCodeDataUrl, qrX, qrY, {
                width: qrSize,
                height: qrSize,
            });

            doc
                .fontSize(8)
                .fillColor('#9ca3af')
                .text('Vérifier ce certificat', qrX - 10, qrY + qrSize + 5, {
                    width: qrSize + 20,
                    align: 'center',
                });

            // Verification code
            doc
                .fontSize(10)
                .fillColor('#6b7280')
                .text(`Code: ${data.verificationCode}`, 60, doc.page.height - 80);

            // Signature
            doc
                .fontSize(16)
                .font('Helvetica-Bold')
                .fillColor('#1f2937')
                .text('JOM Platform', doc.page.width / 2 - 100, doc.page.height - 120, {
                    width: 200,
                    align: 'center',
                });

            doc
                .moveTo(doc.page.width / 2 - 80, doc.page.height - 95)
                .lineTo(doc.page.width / 2 + 80, doc.page.height - 95)
                .stroke('#1f2937');

            doc
                .fontSize(12)
                .font('Helvetica')
                .fillColor('#6b7280')
                .text('Plateforme Officielle', doc.page.width / 2 - 100, doc.page.height - 85, {
                    width: 200,
                    align: 'center',
                });

            doc.end();
        });
    }

    /**
     * Upload certificate PDF to S3
     */
    private async uploadCertificatePDF(
        buffer: Buffer,
        certificateId: string,
    ): Promise<{ url: string; key: string }> {
        const file = {
            buffer,
            originalname: `certificate-${certificateId}.pdf`,
            mimetype: 'application/pdf',
        } as any;

        return this.fileUploadService.uploadFile(file, 'certificates');
    }

    /**
     * Generate verification code
     */
    private generateVerificationCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 12; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Generate certificate number
     */
    private generateCertificateNumber(): string {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 100000)
            .toString()
            .padStart(5, '0');
        return `JOM-${year}-${random}`;
    }

    /**
     * Calculate grade from progress
     */
    private calculateGrade(progress: StudentProgressDocument): string {
        // Calculate average quiz score
        let totalScore = 0;
        let quizCount = 0;

        if (progress.quizAttempts && progress.quizAttempts.length > 0) {
            // Group by quizId/contentId to find best score per quiz
            const quizzes: { [key: string]: number } = {};

            progress.quizAttempts.forEach((attempt: any) => {
                const quizId = attempt.quizId || attempt.contentId; // Handle both if schema changed
                if (!quizzes[quizId] || attempt.score > quizzes[quizId]) {
                    quizzes[quizId] = attempt.score;
                }
            });

            const scores = Object.values(quizzes);
            totalScore = scores.reduce((sum, score) => sum + score, 0);
            quizCount = scores.length;
        }

        const avgScore = quizCount > 0 ? totalScore / quizCount : 100;

        if (avgScore >= 90) return 'Excellent';
        if (avgScore >= 80) return 'Très Bien';
        if (avgScore >= 70) return 'Bien';
        return 'Passable';
    }

    /**
     * Verify certificate
     */
    async verifyCertificate(verificationCode: string): Promise<CertificateDocument | null> {
        return this.certificateModel
            .findOne({ verificationCode })
            .populate('studentId', 'name email')
            .populate('courseId', 'title');
    }

    /**
     * Get user certificates
     */
    async getUserCertificates(userId: string | Types.ObjectId): Promise<CertificateDocument[]> {
        return this.certificateModel
            .find({ studentId: new Types.ObjectId(userId) })
            .populate('courseId', 'title thumbnail')
            .sort({ issuedDate: -1 });
    }

    /**
     * Get certificate by ID
     */
    async getCertificate(certificateId: string | Types.ObjectId): Promise<CertificateDocument> {
        const certificate = await this.certificateModel
            .findById(certificateId)
            .populate('studentId', 'name email')
            .populate('courseId', 'title');

        if (!certificate) {
            throw new NotFoundException('Certificate not found');
        }

        return certificate;
    }
}
