import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument, JobStatus, JobType } from './schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchDto } from '../../common/dto/search.dto';

@Injectable()
export class JobsService {
    constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) { }

    async create(createJobDto: CreateJobDto, userId: string): Promise<Job> {
        const createdJob = new this.jobModel({
            ...createJobDto,
            employer: userId,
            isPremium: createJobDto.autoBroadcast || false,
        });

        return createdJob.save();
    }

    async findAll(paginationDto: PaginationDto, filters: any = {}): Promise<{ data: Job[]; total: number; page: number; limit: number }> {
        const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = paginationDto;
        const skip = (page - 1) * limit;

        // Default to showing only published jobs unless specified
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

        // Soft delete
        job.deletedAt = new Date();
        job.status = JobStatus.CLOSED;
        return job.save();
    }

    async search(searchDto: SearchDto): Promise<{ data: Job[]; total: number }> {
        const { q, page = 1, limit = 10 } = searchDto;
        const skip = (page - 1) * limit;

        // Use text index for title/description
        const filter: any = { status: JobStatus.PUBLISHED, deletedAt: null };
        if (q) {
            filter.$text = { $search: q };
        }

        const [data, total] = await Promise.all([
            this.jobModel.find(filter).populate('employer', 'email isVerified').skip(skip).limit(limit).exec(),
            this.jobModel.countDocuments(filter).exec(),
        ]);

        return { data, total };
    }
}
