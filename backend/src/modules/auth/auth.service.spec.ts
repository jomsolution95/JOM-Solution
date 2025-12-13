import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
    // Mock implementations
    findByEmail: jest.fn(),
    create: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn(() => 'mock-token'),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        it('should return access_token', async () => {
            const user = {
                _id: 'userId',
                email: 'test@test.com',
                role: 'individual',
                password: 'hashedPassword'
            };

            // We assume validateUser is handled or we test login directly if it calls validateUser
            // In a real integration test we'd mock bcrypt.compare

            const result = await service.login(user as any);
            expect(result).toHaveProperty('access_token');
            expect(result.access_token).toBe('mock-token');
        });
    });
});
