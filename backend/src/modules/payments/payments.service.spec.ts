import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { EscrowService } from '../escrow/escrow.service';
import { getModelToken } from '@nestjs/mongoose';
import { Transaction } from '../services/schemas/transaction.schema';
import { Order } from '../services/schemas/order.schema';

describe('PaymentsService', () => {
    let service: PaymentsService;

    const mockEscrowService = {
        createEscrow: jest.fn(),
        releaseFunds: jest.fn(),
        refundFunds: jest.fn(),
    };

    const mockTransactionModel = {
        create: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
    };

    const mockOrderModel = {
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                { provide: EscrowService, useValue: mockEscrowService },
                { provide: getModelToken(Transaction.name), useValue: mockTransactionModel },
                { provide: getModelToken(Order.name), useValue: mockOrderModel },
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
