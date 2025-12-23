import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { PremiumService } from '../premium/premium.service';
import { Job } from '../jobs/schemas/job.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../notifications/email.service';
import { UsersService } from '../users/users.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class ApplicationsService {
    constructor(
        @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
        @InjectModel(Job.name) private jobModel: Model<any>,
        private premiumService: PremiumService,
        private notificationsService: NotificationsService,
        private emailService: EmailService,
        private usersService: UsersService
    ) { }

    async apply(userId: string, jobId: string, cvId: string, coverLetter?: string): Promise<Application> {
        // 1. Check Job Existence & Status
        const job = await this.jobModel.findById(jobId);
        if (!job) throw new NotFoundException('Job not found');
        if (job.status !== 'active' && job.status !== 'published') {
            throw new BadRequestException('This job is no longer accepting applications.');
        }

        // 2. Check Duplicate
        const existing = await this.applicationModel.findOne({
            jobId: new Types.ObjectId(jobId),
            applicantId: new Types.ObjectId(userId)
        });
        if (existing) throw new BadRequestException('You have already applied to this job.');

        // 3. Freemium Limit Check
        const hasPremium = await this.premiumService.hasActiveSubscription(userId);
        if (!hasPremium) {
            // Count applications in last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const count = await this.applicationModel.countDocuments({
                applicantId: new Types.ObjectId(userId),
                createdAt: { $gte: thirtyDaysAgo }
            });

            // LIMIT: 5 applications per month for free users
            if (count >= 5) {
                throw new ForbiddenException('Limite atteinte (5 candidatures/mois). Passez au plan Pro pour postuler en illimité !');
            }
        }

        // 4. Create Application
        const application = new this.applicationModel({
            jobId: new Types.ObjectId(jobId),
            applicantId: new Types.ObjectId(userId),
            cvId: new Types.ObjectId(cvId),
            coverLetter,
            status: 'pending'
        });

        const savedApplication = await application.save();

        // 5. Notify Employer & Candidate

        // Fetch User Info
        const [candidate, employer] = await Promise.all([
            this.usersService.findOne(userId),
            this.usersService.findOne(job.employer.toString())
        ]);

        if (candidate) {
            // Email to Candidate
            this.emailService.sendApplicationConfirmation(
                candidate.email,
                job.title,
                job.companyName || 'L\'entreprise'
            ).catch(e => console.error(e));
        }

        if (employer) {
            // Platform Notification to Employer
            await this.notificationsService.send(
                job.employer.toString(),
                NotificationType.JOB_APPLICATION,
                `Nouvelle candidature pour ${job.title}`,
                `Un candidat vient de postuler à votre offre "${job.title}". Consultez son CV maintenant.`,
                `/dashboard/applications`
            );

            // Email to Employer
            this.emailService.sendNewApplicationAlert(
                employer.email,
                job.title,
                candidate ? (candidate.name || 'Un candidat') : 'Un candidat'
            ).catch(e => console.error(e));
        }

        return savedApplication;
    }

    async findAllByApplicant(userId: string): Promise<Application[]> {
        return this.applicationModel.find({ applicantId: userId })
            .populate('jobId', 'title companyName location')
            .sort({ createdAt: -1 });
    }

    async findAllByJob(jobId: string, employerId: string): Promise<Application[]> {
        // Verify ownership
        const job = await this.jobModel.findById(jobId);
        if (!job) throw new NotFoundException('Job not found');
        if (job.employer.toString() !== employerId) throw new ForbiddenException('Not your job');

        return this.applicationModel.find({ jobId })
            .populate('applicantId', 'name email avatar')
            .populate('cvId')
            .sort({ createdAt: -1 });
    }
}
