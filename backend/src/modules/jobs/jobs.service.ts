
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument, JobStatus, JobType } from './schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchDto } from '../../common/dto/search.dto';
import { RecruitmentPackService } from '../premium/services/recruitment-pack.service';
import { PremiumService } from '../premium/premium.service';
import { SubscriptionPlan } from '../premium/schemas/subscription.schema';
import { QuotaType } from '../premium/schemas/premiumQuotas.schema';

@Injectable()
export class JobsService {
    constructor(
        @InjectModel(Job.name) private jobModel: Model<JobDocument>,
        private recruitmentPackService: RecruitmentPackService,
        private premiumService: PremiumService
    ) { }

    async create(createJobDto: CreateJobDto, userId: string): Promise<Job> {
        const isPremiumRequest = createJobDto.autoBroadcast || false;

        // --- PREMIUM JOB LOGIC ---
        if (isPremiumRequest) {
            // Must have a credit in a Recruitment Pack OR a Subscription that covers it (if applicable)
            // For now, "autoBroadcast" implies consuming a credit from a pack, as per specs.
            // Or if they have COMPANY_BIZ, maybe they get 10 posts/month?

            // Check Subscription first
            const hasSubscription = await this.premiumService.hasQuotaAvailable(userId, QuotaType.JOB_POSTS);

            if (hasSubscription) {
                // Consume Subscription Quota
                await this.premiumService.incrementQuota(userId, QuotaType.JOB_POSTS);
            } else {
                // Try Recruitment Pack
                try {
                    // We consume a credit from the pack. 
                    // Note: consumeCredit requires a jobId, but we haven't created it yet.
                    // This is a chicken-egg problem in the logic of consumeCredit if it needs ID.
                    // Let's look at consumeCredit implementation: it takes jobId.
                    // So we must create the job first, then consume. If consume fails, we rollback (delete job).
                } catch (e) {
                    throw new ForbiddenException('You need a Recruitment Pack or Premium Subscription to post a Premium Job.');
                }
            }
        }

        // --- FREEMIUM LOGIC ---
        if (!isPremiumRequest) {
            // Check if user has active subscription
            const hasSub = await this.premiumService.hasActiveSubscription(userId);

            if (!hasSub) {
                // Free user: Check limit
                const activeJobs = await this.jobModel.countDocuments({
                    employer: userId,
                    status: JobStatus.PUBLISHED,
                    deletedAt: null
                });

                if (activeJobs >= 3) {
                    throw new ForbiddenException('Limite atteinte pour le plan Gratuit (3 annonces actives). Passez Premium pour illimité.');
                }
            }
        }

        // CREATE JOB
        const createdJob = new this.jobModel({
            ...createJobDto,
            employer: userId,
            isPremium: isPremiumRequest,
        });
        const savedJob = await createdJob.save();

        // CONFIRM CONSUMPTION (If Premium & No Sub)
        if (isPremiumRequest) {
            const hasSubscription = await this.premiumService.hasQuotaAvailable(userId, QuotaType.JOB_POSTS);
            if (!hasSubscription) {
                try {
                    await this.recruitmentPackService.consumeCredit(userId, savedJob._id);
                } catch (error) {
                    // Rollback
                    await this.jobModel.findByIdAndDelete(savedJob._id);
                    throw new ForbiddenException('Impossible d\'utiliser le crédit Pack Recrutement (Solde insuffisant ou expiré).');
                }
            }
        }

        return savedJob;
    }

    async findAll(paginationDto: PaginationDto, filters: any = {}): Promise<{ data: Job[]; total: number; page: number; limit: number }> {
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = paginationDto;
        const skip = (page - 1) * limit;

        const queryFilters = { status: JobStatus.PUBLISHED, deletedAt: null, ...filters };

        const query = this.jobModel.find(queryFilters).populate('employer', 'email isVerified');
        const sortOptions: any = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            query.sort(sortOptions).skip(skip).limit(limit).exec(),
            this.jobModel.countDocuments(queryFilters).exec(),
        ]);

        return { data, total, page, limit };
    }

    async findOne(id: string): Promise<Job> {
        const job = await this.jobModel.findOne({ _id: id, deletedAt: null }).populate('employer', 'email isVerified roles').exec();
        if (!job) throw new NotFoundException(`Job with ID ${id} not found`);
        return job;
    }

    async update(id: string, updateJobDto: UpdateJobDto, userId: string, isAdmin: boolean = false): Promise<Job> {
        const job = await this.jobModel.findById(id);
        if (!job) throw new NotFoundException(`Job with ID ${id} not found`);

        if (job.employer.toString() !== userId && !isAdmin) {
            throw new ForbiddenException('You do not have permission to update this job');
        }

        const updatedJob = await this.jobModel
            .findByIdAndUpdate(id, updateJobDto, { new: true })
            .exec();

        return updatedJob!;
    }

    async remove(id: string, userId: string, isAdmin: boolean = false): Promise<Job> {
        const job = await this.jobModel.findById(id);
        if (!job) throw new NotFoundException(`Job with ID ${id} not found`);

        if (job.employer.toString() !== userId && !isAdmin) {
            throw new ForbiddenException('You do not have permission to delete this job');
        }

        job.deletedAt = new Date();
        job.status = JobStatus.CLOSED;
        return job.save();
    }

    async search(searchDto: SearchDto): Promise<{ data: Job[]; total: number }> {
        const { q, page = 1, limit = 10 } = searchDto;
        const skip = (page - 1) * limit;

        const filter: any = { status: JobStatus.PUBLISHED, deletedAt: null };
        if (q) {
            filter.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.jobModel.find(filter).populate('employer', 'email isVerified').skip(skip).limit(limit).exec(),
            this.jobModel.countDocuments(filter).exec(),
        ]);

        return { data, total };
    }
}
