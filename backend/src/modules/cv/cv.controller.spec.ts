import { Test, TestingModule } from '@nestjs/testing';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';

const mockCvService = {
    create: jest.fn(dto => Promise.resolve({ _id: 'cvId', ...dto })),
    findAll: jest.fn(() => Promise.resolve([])),
    findOne: jest.fn(id => Promise.resolve({ _id: id })),
    update: jest.fn((id, dto) => Promise.resolve({ _id: id, ...dto })),
    remove: jest.fn(() => Promise.resolve({ deleted: true })),
    generatePdf: jest.fn(() => Promise.resolve(Buffer.from('pdf'))),
};

describe('CvController', () => {
    let controller: CvController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CvController],
            providers: [
                {
                    provide: CvService,
                    useValue: mockCvService,
                },
            ],
        }).compile();

        controller = module.get<CvController>(CvController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a CV', async () => {
            const dto = { title: 'New CV' };
            const userId = 'userId';
            expect(await controller.create(dto, userId)).toEqual({ _id: 'cvId', ...dto });
            expect(mockCvService.create).toHaveBeenCalledWith(dto, userId);
        });
    });

    describe('findOne', () => {
        it('should find a CV by id', async () => {
            const id = 'cvId';
            expect(await controller.findOne(id)).toHaveProperty('_id', id);
        });
    });
});
