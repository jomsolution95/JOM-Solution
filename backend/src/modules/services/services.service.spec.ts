import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { getModelToken } from '@nestjs/mongoose';
import { Service } from './schemas/service.schema';
import { CacheService } from '../../common/cache/cache.service';

describe('ServicesService', () => {
    let service: ServicesService;

    const mockServiceModel = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        countDocuments: jest.fn(),
    };

    const mockCacheService = {
        del: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ServicesService,
                { provide: getModelToken(Service.name), useValue: mockServiceModel },
                { provide: CacheService, useValue: mockCacheService },
            ],
        }).compile();

        service = module.get<ServicesService>(ServicesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
