import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { getModelToken } from '@nestjs/mongoose';
import { Profile } from '../users/schemas/profile.schema';
import { CacheService } from '../../common/cache/cache.service';

describe('ProfilesService', () => {
    let service: ProfilesService;

    const mockProfileModel = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        findOneAndUpdate: jest.fn(),
        countDocuments: jest.fn(),
    };

    const mockCacheService = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProfilesService,
                {
                    provide: getModelToken(Profile.name),
                    useValue: mockProfileModel,
                },
                {
                    provide: CacheService,
                    useValue: mockCacheService
                }
            ],
        }).compile();

        service = module.get<ProfilesService>(ProfilesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
