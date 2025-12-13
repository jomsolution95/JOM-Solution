import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchDto } from '../../common/dto/search.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JobStatus, JobType } from './schemas/job.schema';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Post()
    @UseGuards(AccessTokenGuard)
    create(@Body() createJobDto: CreateJobDto, @GetUser('sub') userId: string) {
        return this.jobsService.create(createJobDto, userId);
    }

    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300)
    @Get()
    findAll(
        @Query() paginationDto: PaginationDto,
        @Query('type') type?: JobType,
        @Query('status') status?: JobStatus,
        @Query('isRemote') isRemote?: string,
        @Query('budget') budget?: string,
    ) {
        const filters: any = {};
        if (type) filters.type = type;
        if (status) filters.status = status;
        if (isRemote !== undefined) filters.isRemote = isRemote === 'true';
        if (budget) filters.budget = budget;

        return this.jobsService.findAll(paginationDto, filters);
    }

    @Get('search')
    search(@Query() searchDto: SearchDto) {
        return this.jobsService.search(searchDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.jobsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AccessTokenGuard)
    update(
        @Param('id') id: string,
        @Body() updateJobDto: UpdateJobDto,
        @GetUser('sub') userId: string,
        @GetUser('roles') roles: string[],
    ) {
        const isAdmin = roles.includes('admin');
        return this.jobsService.update(id, updateJobDto, userId, isAdmin);
    }

    @Delete(':id')
    @UseGuards(AccessTokenGuard)
    remove(@Param('id') id: string, @GetUser('sub') userId: string, @GetUser('roles') roles: string[]) {
        const isAdmin = roles.includes('admin');
        return this.jobsService.remove(id, userId, isAdmin);
    }
}
