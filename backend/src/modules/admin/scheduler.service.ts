import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduledTask, ScheduledTaskDocument } from './schemas/scheduled-task.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        @InjectModel(ScheduledTask.name) private taskModel: Model<ScheduledTaskDocument>,
        @InjectModel(User.name) private userModel: Model<any>,
        private readonly notificationsService: NotificationsService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        const now = new Date();
        const pendingTasks = await this.taskModel.find({
            status: 'PENDING',
            executeAt: { $lte: now }
        });

        if (pendingTasks.length > 0) {
            this.logger.log(`Found ${pendingTasks.length} pending tasks to execute.`);
        }

        for (const task of pendingTasks) {
            await this.executeTask(task);
        }
    }

    private async executeTask(task: ScheduledTaskDocument) {
        try {
            switch (task.action) {
                case 'BROADCAST':
                    await this.executeBroadcast(task.payload);
                    break;
                default:
                    this.logger.warn(`Unknown action: ${task.action}`);
            }

            task.status = 'COMPLETED';
            await task.save();
            this.logger.log(`Task ${task._id} executed successfully.`);

        } catch (err: any) {
            this.logger.error(`Failed to execute task ${task._id}`, err.stack);
            task.status = 'FAILED';
            task.errorLog = err.message;
            await task.save();
        }
    }

    private async executeBroadcast(payload: { title: string, message: string, targetRole: string, filters?: any }) {
        let query: any = {};

        // Basic Role Filter
        if (payload.targetRole && payload.targetRole !== 'ALL') {
            query.roles = payload.targetRole;
        }

        // Advanced Filters (from payload.filters)
        if (payload.filters) {
            if (payload.filters.isVerified) query.isVerified = true;
            if (payload.filters.hasPremium) {
                // Assuming premium is a role or flag. If complicated, might need PremiumService.
                // For now, let's assume 'premium' role or similar.
                // query.roles = { $in: ['premium'] }; // Simplified
            }
            if (payload.filters.userIds && payload.filters.userIds.length > 0) {
                query._id = { $in: payload.filters.userIds };
            }
        }

        const users = await this.userModel.find(query).select('_id');
        this.logger.log(`Executing Broadcast to ${users.length} users. Title: ${payload.title}`);

        for (const user of users) {
            try {
                await this.notificationsService.send(user._id.toString(), 'system' as any, payload.title, payload.message);
            } catch (err) {
                console.error(`Failed to send scheduled broadcast to ${user._id}`, err);
            }
        }
    }

    async scheduleTask(action: string, payload: any, executeAt: Date, userId: string) {
        return this.taskModel.create({
            action,
            payload,
            executeAt,
            createdBy: userId
        });
    }

    async getScheduledTasks() {
        return this.taskModel.find({ status: 'PENDING' }).sort({ executeAt: 1 });
    }

    async cancelTask(taskId: string) {
        return this.taskModel.findByIdAndUpdate(taskId, { status: 'CANCELLED' }); // Need to add CANCELLED to enum or just delete
    }
}
