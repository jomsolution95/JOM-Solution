import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectQueue('notifications') private notificationsQueue: Queue,
    ) { }

    async send(userId: string, type: NotificationType, title: string, message: string, link?: string) {
        // Add to Queue
        await this.notificationsQueue.add('sendKey', {
            userId,
            type,
            title,
            message,
            link,
        });
        return { status: 'queued' };
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
