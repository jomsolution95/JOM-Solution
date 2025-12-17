import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProfileView, ProfileViewDocument } from '../schemas/profileViews.schema';
import { Application } from '../../jobs/schemas/application.schema';
import { StudentProgress, StudentProgressDocument } from '../schemas/studentProgress.schema';
import { Job } from '../../jobs/schemas/job.schema';
import { Order } from '../../services/schemas/order.schema';

@Injectable()
export class StatsService {
    constructor(
        @InjectModel(ProfileView.name)
        private profileViewModel: Model<ProfileViewDocument>,
        @InjectModel(StudentProgress.name)
        private studentProgressModel: Model<StudentProgressDocument>,
        @InjectModel(Job.name) private jobModel: Model<any>,
        @InjectModel(Application.name) private applicationModel: Model<any>,
        @InjectModel(Order.name) private orderModel: Model<any>,
    ) { }

    /**
     * Get profile statistics (Individual users)
     */
    async getProfileStats(userId: string | Types.ObjectId): Promise<any> {
        const userObjectId = new Types.ObjectId(userId);

        // 1. ORDERS & EXPENSES
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const expensesResult = await this.orderModel.aggregate([
            { $match: { buyer: userObjectId, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: '$amount' },
                    monthSpent: {
                        $sum: {
                            $cond: [{ $gte: ['$createdAt', startOfMonth] }, '$amount', 0]
                        }
                    },
                    totalOrders: { $sum: 1 },
                    activeOrders: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['pending', 'in_progress']] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const expenses = expensesResult[0] || { totalSpent: 0, monthSpent: 0, totalOrders: 0, activeOrders: 0 };

        // 2. APPLICATIONS
        const applicationsResult = await this.applicationModel.aggregate([
            { $match: { applicant: userObjectId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    viewed: {
                        $sum: {
                            $cond: [{ $ne: ['$status', 'pending'] }, 1, 0] // Assumes 'pending' is unseen
                        }
                    }
                }
            }
        ]);
        const applications = applicationsResult[0] || { total: 0, viewed: 0 };

        // 3. CERTIFICATIONS & LEARNING
        const learningResult = await this.studentProgressModel.aggregate([
            { $match: { studentId: userObjectId } },
            {
                $group: {
                    _id: null,
                    totalEnrolled: { $sum: 1 },
                    completed: {
                        $sum: { $cond: ['$completed', 1, 0] }
                    },
                    inProgress: {
                        $sum: { $cond: [{ $eq: ['$completed', false] }, 1, 0] }
                    }
                }
            }
        ]);
        const learning = learningResult[0] || { totalEnrolled: 0, completed: 0, inProgress: 0 };

        // 4. PROFILE VIEWS (Existing Logic)
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

        const viewsBySource = await this.profileViewModel.aggregate([
            { $match: { profileId: userObjectId } },
            { $group: { _id: '$source', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const recentViewers = await this.profileViewModel
            .find({ profileId: userObjectId })
            .sort({ date: -1 })
            .limit(5)
            .populate('viewerId', 'name email company avatar'); // Added avatar

        return {
            expenses: {
                total: expenses.totalSpent,
                month: expenses.monthSpent,
                trend: 'up', // improved later
                percentage: 12   // improved later
            },
            orders: {
                total: expenses.totalOrders,
                active: expenses.activeOrders
            },
            applications: {
                total: applications.total,
                viewed: applications.viewed
            },
            certifications: {
                total: learning.completed,
                inProgress: learning.inProgress
            },
            views: {
                total: totalViews,
                byDate: viewsByDate,
                bySource: viewsBySource,
                recent: recentViewers
            }
        };
    }

    /**
     * Get recruitment statistics for companies
     */
    async getRecruitmentStats(userId: string | Types.ObjectId): Promise<any> {
        const companyId = new Types.ObjectId(userId);

        // 1. Job Stats
        const totalJobs = await this.jobModel.countDocuments({ companyId });
        const activeJobs = await this.jobModel.countDocuments({ companyId, status: 'active' });

        // 2. Application Stats
        // Find all jobs by this company first
        const companyJobs = await this.jobModel.find({ companyId }).select('_id');
        const jobIds = companyJobs.map(j => j._id);

        const totalApplications = await this.applicationModel.countDocuments({
            job: { $in: jobIds }
        });

        // 3. Applications by Status
        const applicationsByStatus = await this.applicationModel.aggregate([
            { $match: { job: { $in: jobIds } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 4. Recent Applications (Graph Data - Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const applicationsByDate = await this.applicationModel.aggregate([
            {
                $match: {
                    job: { $in: jobIds },
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 5. Top Performing Jobs (Most Applications)
        const topPerformingJobsRaw = await this.jobModel.aggregate([
            { $match: { companyId } },
            {
                $lookup: {
                    from: 'applications',
                    localField: '_id',
                    foreignField: 'job',
                    as: 'apps'
                }
            },
            {
                $project: {
                    title: 1,
                    applications: { $size: '$apps' },
                    conversion: {
                        $size: {
                            $filter: {
                                input: '$apps',
                                as: 'app',
                                cond: { $eq: ['$$app.status', 'hired'] }
                            }
                        }
                    }
                }
            },
            { $sort: { applications: -1 } },
            { $limit: 4 }
        ]);

        const topPerformingJobs = topPerformingJobsRaw.map(j => ({
            title: j.title,
            applications: j.applications,
            conversion: j.conversion
        }));

        // 6. Recruiter Performance (Approximated by Jobs Created / Hires)
        // Group jobs by employer (Recruiter) and count applications/hires
        // Note: For companies with multiple recruiters, this breaks down performance by user.
        const recruiterStats = await this.jobModel.aggregate([
            { $match: { companyId } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'employer',
                    foreignField: '_id',
                    as: 'employerDetails'
                }
            },
            { $unwind: { path: '$employerDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'applications',
                    localField: '_id',
                    foreignField: 'job',
                    as: 'applications'
                }
            },
            {
                $project: {
                    recruiterName: {
                        $cond: {
                            if: { $gt: [{ $type: "$employerDetails" }, "missing"] },
                            then: { $concat: ['$employerDetails.firstName', ' ', '$employerDetails.lastName'] },
                            else: "Admin"
                        }
                    },
                    jobCount: { $literal: 1 },
                    applicationCount: { $size: '$applications' },
                    hireCount: {
                        $size: {
                            $filter: {
                                input: '$applications',
                                as: 'app',
                                cond: { $eq: ['$$app.status', 'hired'] }
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$recruiterName',
                    jobs: { $sum: 1 },
                    applications: { $sum: '$applicationCount' },
                    hires: { $sum: '$hireCount' },
                    // Mock Time (Hard to calculate without history logs)
                    avgTime: { $first: '12j' }
                }
            },
            { $sort: { hires: -1 } },
            { $limit: 5 }
        ]);

        const recruiterPerformance = recruiterStats.map(r => ({
            name: r._id || 'Inconnu',
            jobs: r.jobs,
            applications: r.applications,
            hires: r.hires,
            avgTime: r.avgTime
        }));

        return {
            totalJobs,
            activeJobs,
            totalApplications,
            applicationsByStatus,
            conversionRate: totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 100) / 100 : 0,
            applicationsByDate,
            topPerformingJobs,
            recruiterPerformance,
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

        // Calculate percentile (Simulated for now, would need real distribution logic)
        // In a real app: count users in category with fewer views than current user
        const totalInCategory = 100; // Mock total
        const rank = 1; // Mock rank

        return {
            rank,
            totalInCategory,
            percentile: 95,
            userViews,
            categoryAverage: 45,
            recruiterPerformance: [], // Not relevant for candidate ranking
        };
    }
}
