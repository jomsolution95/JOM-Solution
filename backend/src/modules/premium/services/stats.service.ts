import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProfileView, ProfileViewDocument } from '../schemas/profileViews.schema';
import { Application } from '../../jobs/schemas/application.schema';
import { StudentProgress, StudentProgressDocument } from '../schemas/studentProgress.schema';

@Injectable()
export class StatsService {
    constructor(
        @InjectModel(ProfileView.name)
        private profileViewModel: Model<ProfileViewDocument>,
        @InjectModel(StudentProgress.name)
        private studentProgressModel: Model<StudentProgressDocument>,
    ) { }

    /**
     * Get profile view statistics for individual users
     */
    async getProfileStats(userId: string | Types.ObjectId): Promise<any> {
        const userObjectId = new Types.ObjectId(userId);

        // Total views
        const totalViews = await this.profileViewModel.countDocuments({
            profileId: userObjectId,
        });

        // Views by date (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const viewsByDate = await this.profileViewModel.aggregate([
            {
                $match: {
                    profileId: userObjectId,
                    date: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$date' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        // Views by source
        const viewsBySource = await this.profileViewModel.aggregate([
            {
                $match: { profileId: userObjectId },
            },
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        // Recent viewers (last 10)
        const recentViewers = await this.profileViewModel
            .find({ profileId: userObjectId })
            .sort({ date: -1 })
            .limit(10)
            .populate('viewerId', 'name email company');

        // Views this week vs last week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const thisWeekViews = await this.profileViewModel.countDocuments({
            profileId: userObjectId,
            date: { $gte: oneWeekAgo },
        });

        const lastWeekViews = await this.profileViewModel.countDocuments({
            profileId: userObjectId,
            date: { $gte: twoWeeksAgo, $lt: oneWeekAgo },
        });

        const weeklyGrowth = lastWeekViews > 0
            ? ((thisWeekViews - lastWeekViews) / lastWeekViews) * 100
            : 0;

        return {
            totalViews,
            thisWeekViews,
            lastWeekViews,
            weeklyGrowth: Math.round(weeklyGrowth),
            viewsByDate,
            viewsBySource,
            recentViewers,
        };
    }

    /**
     * Get recruitment statistics for companies
     */
    async getRecruitmentStats(userId: string | Types.ObjectId): Promise<any> {
        // Note: This would aggregate from Job and Application collections
        // For now, returning structure

        const userObjectId = new Types.ObjectId(userId);

        // Mock data structure - replace with actual aggregations
        return {
            totalJobs: 0,
            activeJobs: 0,
            totalApplications: 0,
            applicationsByStatus: [],
            conversionRate: 0,
            averageTimeToHire: 0,
            topPerformingJobs: [],
            applicationsBySource: [],
            applicationsByDate: [],
            recruiterPerformance: [],
        };
    }

    /**
     * Get academy statistics for educational institutions
     */
    async getAcademyStats(institutionId: string | Types.ObjectId): Promise<any> {
        const institutionObjectId = new Types.ObjectId(institutionId);

        // Total enrollments
        const totalEnrollments = await this.studentProgressModel.countDocuments({
            // Filter by institution courses
        });

        // Completion rate
        const completedCourses = await this.studentProgressModel.countDocuments({
            completed: true,
        });

        const completionRate = totalEnrollments > 0
            ? (completedCourses / totalEnrollments) * 100
            : 0;

        // Average progress
        const avgProgressResult = await this.studentProgressModel.aggregate([
            {
                $group: {
                    _id: null,
                    avgProgress: { $avg: '$progress' },
                },
            },
        ]);

        const avgProgress = avgProgressResult[0]?.avgProgress || 0;

        // Enrollments by course
        const enrollmentsByCourse = await this.studentProgressModel.aggregate([
            {
                $group: {
                    _id: '$courseId',
                    count: { $sum: 1 },
                    avgProgress: { $avg: '$progress' },
                    completed: {
                        $sum: { $cond: ['$completed', 1, 0] },
                    },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 10,
            },
        ]);

        // Progress distribution
        const progressDistribution = await this.studentProgressModel.aggregate([
            {
                $bucket: {
                    groupBy: '$progress',
                    boundaries: [0, 25, 50, 75, 100],
                    default: 'Other',
                    output: {
                        count: { $sum: 1 },
                    },
                },
            },
        ]);

        // Top abandoned modules
        const abandonedModules = await this.studentProgressModel.aggregate([
            {
                $match: {
                    completed: false,
                    progress: { $gt: 0, $lt: 100 },
                },
            },
            {
                $unwind: '$moduleProgress',
            },
            {
                $match: {
                    'moduleProgress.completed': false,
                },
            },
            {
                $group: {
                    _id: '$moduleProgress.moduleId',
                    moduleName: { $first: '$moduleProgress.moduleName' },
                    abandonCount: { $sum: 1 },
                },
            },
            {
                $sort: { abandonCount: -1 },
            },
            {
                $limit: 10,
            },
        ]);

        // Activity heatmap (by day of week and hour)
        const activityHeatmap = await this.studentProgressModel.aggregate([
            {
                $match: {
                    lastAccessedAt: { $exists: true },
                },
            },
            {
                $group: {
                    _id: {
                        dayOfWeek: { $dayOfWeek: '$lastAccessedAt' },
                        hour: { $hour: '$lastAccessedAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { '_id.dayOfWeek': 1, '_id.hour': 1 },
            },
        ]);

        return {
            totalEnrollments,
            completedCourses,
            completionRate: Math.round(completionRate),
            avgProgress: Math.round(avgProgress),
            enrollmentsByCourse,
            progressDistribution,
            abandonedModules,
            activityHeatmap,
        };
    }

    /**
     * Get ranking for user in their category
     */
    async getUserRanking(userId: string | Types.ObjectId, category: string): Promise<any> {
        const userObjectId = new Types.ObjectId(userId);

        // Get user's view count
        const userViews = await this.profileViewModel.countDocuments({
            profileId: userObjectId,
        });

        // Get all users in category with their view counts
        // Note: This would need to join with User collection
        // For now, returning mock structure

        return {
            rank: 0,
            totalInCategory: 0,
            percentile: 0,
            userViews,
            categoryAverage: 0,
        };
    }
}
