import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { EmailService } from './email.service';
import { User } from '../users/schemas/user.schema'; // Assuming User Schema path

@Processor('notifications')
@Injectable()
export class NotificationProcessor extends WorkerHost {
    constructor(
        private readonly notificationsGateway: NotificationsGateway,
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel('User') private userModel: Model<any>, // Quick fix for User injection or use UsersService if cleaner
        private emailService: EmailService
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { userId, type, title, message, link } = job.data;
        console.log(`Processing notification for user ${userId}: ${title}`);

        // 1. Save to Database
        const notification = new this.notificationModel({
            recipient: userId,
            type,
            title,
            message,
            link,
        });
        await notification.save();

        // 2. Emit Real-time
        this.notificationsGateway.emitNotification(userId, notification);

        // 3. Send Email (Resend)
        try {
            // Fetch User Email (Need to ensure User Model is injected correctly in Module)
            // For safety, we just try to find by ID if we can.
            // If User model isn't available, we might skip email or fetch via service.
            // Let's assume we have the email in the job or fetch it.
            // Ideally job.data should contain 'email' to avoid DB lookup here?
            // But let's look it up.

            const user = await this.userModel.findById(userId);
            if (user && user.email) {
                await this.emailService.sendEmail(
                    user.email,
                    `JOM Platform: ${title}`,
                    `<p>${message}</p>${link ? `<a href="${link}">Voir détails</a>` : ''}`
                );
            }
        } catch (error) {
            console.error('Failed to send email notification:', error);
        }

        return { status: 'sent', notificationId: notification._id };
    }
}
