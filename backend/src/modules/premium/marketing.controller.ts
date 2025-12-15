
import { Controller, Post, Body, UseGuards, Request, BadRequestException, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Training, TrainingDocument } from './schemas/training.schema';
import { EmailService } from '../../notifications/email.service';
import { StudentProgress, StudentProgressDocument } from './schemas/studentProgress.schema';

@Controller('academy/marketing')
@UseGuards(JwtAuthGuard)
export class MarketingController {
    constructor(
        @InjectModel(Training.name) private trainingModel: Model<TrainingDocument>,
        @InjectModel(StudentProgress.name) private progressModel: Model<StudentProgressDocument>,
        private emailService: EmailService
    ) { }

    /**
     * Boost a course (Mise en avant)
     */
    @Post('boost/:courseId')
    async boostCourse(@Request() req: any, @Param('courseId') courseId: string) {
        // In a real scenario, this would check for payment verification or subscription limits.
        // For 'Etablissement', this is included in the premium plan (or paid via credits).
        // MVP: We assume it's allowed and just enable it for 30 days.

        const course = await this.trainingModel.findOne({
            _id: courseId,
            institutionId: req.user.userId
        });

        if (!course) {
            throw new BadRequestException('Cours non trouvé ou accès refusé.');
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days boost

        course.isFeatured = true;
        course.featuredExpiresAt = expiresAt;
        await course.save();

        return { success: true, message: 'Cours mis en avant pour 30 jours !', expiresAt };
    }

    /**
     * Send email broadcast to students
     */
    @Post('broadcast')
    async sendBroadcast(@Request() req: any, @Body() body: { courseId?: string, subject: string, message: string }) {
        const { courseId, subject, message } = body;

        if (!subject || !message) {
            throw new BadRequestException('Sujet et message requis.');
        }

        // 1. Find target students
        let query: any = { institutionId: new Types.ObjectId(req.user.userId) };
        if (courseId) {
            query.courseId = new Types.ObjectId(courseId);
        }

        const enrollments = await this.progressModel.find(query).populate('studentId', 'email name');

        if (enrollments.length === 0) {
            return { success: true, count: 0, message: 'Aucun étudiant trouvé pour cette campagne.' };
        }

        // 2. Extract unique emails (in case a student is enrolled in multiple courses)
        const students = new Map<string, { email: string, name: string }>();
        enrollments.forEach(e => {
            const student = e.studentId as any;
            if (student && student.email) {
                students.set(student.email, { email: student.email, name: student.name });
            }
        });

        // 3. Send emails
        // Ideally, use a queue (BullMQ). For MVP, we send in a loop (careful with rate limits).
        let sentCount = 0;
        for (const [email, student] of students) {
            // Basic HTML wrap
            const personalizedHtml = `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Bonjour ${student.name},</h2>
                    <div style="margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                        ${message}
                    </div>
                    <p style="font-size: 12px; color: #888;">
                        Cet email vous a été envoyé par <strong>${req.user.name || 'votre établissement'}</strong> via JOM Academy.
                    </p>
                </div>
             `;

            await this.emailService.sendEmail(email, subject, personalizedHtml);
            sentCount++;
        }

        return { success: true, count: sentCount, message: `Campagne envoyée à ${sentCount} étudiants.` };
    }
}
