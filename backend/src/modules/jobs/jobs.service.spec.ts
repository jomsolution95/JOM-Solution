import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { getModelToken } from '@nestjs/mongoose';
import { Job } from './schemas/job.schema';
import { Application } from './schemas/application.schema';
import { CacheService } from '../../common/cache/cache.service';

describe('JobsService', () => {
    let service: JobsService;

    const mockJobModel = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        countDocuments: jest.fn(),
    };

    const mockApplicationModel = {
        find: jest.fn(),
        deleteMany: jest.fn(),
    };

    const mockCacheService = {
        del: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobsService,
                { provide: getModelToken(Job.name), useValue: mockJobModel },
                { provide: getModelToken(Application.name), useValue: mockApplicationModel },
                { provide: CacheService, useValue: mockCacheService },
            ],
        }).compile();

        service = module.get<JobsService>(JobsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
