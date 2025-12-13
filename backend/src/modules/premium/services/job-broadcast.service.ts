import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class JobBroadcastService {
    private readonly logger = new Logger(JobBroadcastService.name);

    constructor(
        @InjectModel('Job') private jobModel: Model<any>,
        @InjectModel('Post') private postModel: Model<any>,
        @InjectModel('Notification') private notificationModel: Model<any>,
    ) { }

    /**
     * Cron job to broadcast premium jobs
     * Runs every hour
     */
    @Cron(CronExpression.EVERY_HOUR)
    async broadcastPendingJobs() {
        this.logger.log('Starting automatic job broadcast...');

        try {
            // Find jobs with auto-broadcast enabled that haven't been broadcasted yet
            const jobs = await this.jobModel.find({
                autoBroadcast: true,
                broadcasted: { $ne: true },
                status: 'active',
                isPremium: true,
            });

            this.logger.log(`Found ${jobs.length} jobs to broadcast`);

            for (const job of jobs) {
                await this.broadcastJob(job);
            }

            this.logger.log('Job broadcast completed');
        } catch (error: any) {
            this.logger.error('Error broadcasting jobs:', error);
        }
    }

    /**
     * Broadcast a single job to all channels
     */
    async broadcastJob(job: any): Promise<void> {
        try {
            this.logger.log(`Broadcasting job: ${job.title} (${job._id})`);

            // 1. Publish to JOM Network (Social Feed)
            await this.publishToSocialNetwork(job);

            // 2. Add to Homepage Carousel
            await this.addToHomepageCarousel(job);

            // 3. Send targeted push notifications
            await this.sendTargetedNotifications(job);

            // Mark as broadcasted
            job.broadcasted = true;
            job.broadcastedAt = new Date();
            await job.save();

            this.logger.log(`Successfully broadcasted job: ${job._id}`);
        } catch (error: any) {
            this.logger.error(`Error broadcasting job ${job._id}:`, error);
        }
    }

    /**
     * Publish job to social network feed
     */
    private async publishToSocialNetwork(job: any): Promise<void> {
        try {
            const post = new this.postModel({
                userId: job.companyId,
                type: 'job_offer',
                content: this.generateJobPostContent(job),
                jobId: job._id,
                visibility: 'public',
                metadata: {
                    jobTitle: job.title,
                    location: job.location,
                    salary: job.salary,
                    contractType: job.contractType,
                },
                tags: job.skills || [],
            });

            await post.save();
            this.logger.log(`Published job ${job._id} to social network`);
        } catch (error: any) {
            this.logger.error(`Error publishing to social network:`, error);
        }
    }

    /**
     * Add job to homepage carousel
     */
    private async addToHomepageCarousel(job: any): Promise<void> {
        try {
            // Update job to mark as featured
            job.featured = true;
            job.featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            await job.save();

            this.logger.log(`Added job ${job._id} to homepage carousel`);
        } catch (error) {
            this.logger.error(`Error adding to carousel:`, error);
        }
    }

    /**
     * Send targeted push notifications to matching talents
     */
    private async sendTargetedNotifications(job: any): Promise<void> {
        try {
            // Find matching users based on skills, location, etc.
            const targetedUsers = await this.findMatchingTalents(job);

            this.logger.log(`Found ${targetedUsers.length} matching talents for job ${job._id}`);

            // Create notifications for each user
            const notifications = targetedUsers.map((userId) => ({
                userId,
                type: 'job_match',
                title: 'Nouvelle offre qui vous correspond !',
                message: `${job.title} - ${job.location}`,
                data: {
                    jobId: job._id,
                    jobTitle: job.title,
                    companyName: job.companyName,
                },
                read: false,
            }));

            if (notifications.length > 0) {
                await this.notificationModel.insertMany(notifications);
                this.logger.log(`Sent ${notifications.length} notifications for job ${job._id}`);
            }
        } catch (error) {
            this.logger.error(`Error sending notifications:`, error);
        }
    }

    /**
     * Find talents matching job criteria
     */
    private async findMatchingTalents(job: any): Promise<Types.ObjectId[]> {
        try {
            // This would query User collection based on:
            // - Skills matching job.skills
            // - Location matching job.location
            // - User preferences
            // - User role (individual/talent)

            // Mock implementation - replace with actual query
            const matchingUsers: Types.ObjectId[] = [];

            // Example query logic:
            // const users = await this.userModel.find({
            //   role: 'individual',
            //   'profile.skills': { $in: job.skills },
            //   'profile.location': job.location,
            //   'preferences.jobAlerts': true,
            // });

            return matchingUsers;
        } catch (error) {
            this.logger.error(`Error finding matching talents:`, error);
            return [];
        }
    }

    /**
     * Generate social media post content for job
     */
    private generateJobPostContent(job: any): string {
        let content = `🚀 Nouvelle opportunité : ${job.title}\n\n`;

        if (job.companyName) {
            content += `🏢 Entreprise : ${job.companyName}\n`;
        }

        if (job.location) {
            content += `📍 Lieu : ${job.location}\n`;
        }

        if (job.contractType) {
            content += `📝 Type : ${job.contractType}\n`;
        }

        if (job.salary) {
            content += `💰 Salaire : ${job.salary}\n`;
        }

        content += `\n${job.description?.substring(0, 200)}...`;

        content += `\n\n#Emploi #Recrutement #${job.title.replace(/\s+/g, '')}`;

        return content;
    }

    /**
     * Manually trigger broadcast for a specific job
     */
    async manualBroadcast(jobId: string | Types.ObjectId): Promise<void> {
        const job = await this.jobModel.findById(jobId);

        if (!job) {
            throw new Error('Job not found');
        }

        if (!job.isPremium) {
            throw new Error('Only premium jobs can be broadcasted');
        }

        await this.broadcastJob(job);
    }

    /**
     * Get broadcast statistics
     */
    async getBroadcastStats(jobId: string | Types.ObjectId): Promise<any> {
        const job = await this.jobModel.findById(jobId);

        if (!job) {
            throw new Error('Job not found');
        }

        // Count social network post engagement
        const socialPost = await this.postModel.findOne({ jobId });
        const socialEngagement = socialPost ? {
            likes: socialPost.likes?.length || 0,
            comments: socialPost.comments?.length || 0,
            shares: socialPost.shares?.length || 0,
        } : null;

        // Count notifications sent
        const notificationCount = await this.notificationModel.countDocuments({
            'data.jobId': jobId,
            type: 'job_match',
        });

        return {
            broadcasted: job.broadcasted,
            broadcastedAt: job.broadcastedAt,
            featured: job.featured,
            featuredUntil: job.featuredUntil,
            socialEngagement,
            notificationsSent: notificationCount,
        };
    }
}
