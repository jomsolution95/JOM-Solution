import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { NotificationsGateway } from './notifications.gateway';
import { EmailService } from './email.service';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel('User') private userModel: Model<any>,
        private readonly notificationsGateway: NotificationsGateway,
        private readonly emailService: EmailService,
    ) { }

    async send(userId: string, type: NotificationType, title: string, message: string, link?: string) {
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

        // 3. Send Email (Best Effort)
        this.sendEmailSafely(userId, title, message, link);

        return { status: 'sent', notificationId: notification._id };
    }

    private async sendEmailSafely(userId: string, title: string, message: string, link?: string) {
        try {
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
    }

    async findAll(userId: string, paginationDto: PaginationDto) {
        const { page = 1, limit = 20 } = paginationDto;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.notificationModel.find({ recipient: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.notificationModel.countDocuments({ recipient: userId }).exec(),
        ]);

        return { data, total, page, limit };
    }

    async markAsRead(id: string, userId: string) {
        await this.notificationModel.updateOne(
            { _id: id, recipient: userId },
            { isRead: true }
        ).exec();
        return { status: 'success' };
    }

    async getUnreadCount(userId: string) {
        const count = await this.notificationModel.countDocuments({
            recipient: userId,
            isRead: false
        }).exec();
        return { count };
    }
}
