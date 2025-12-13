import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet, WalletDocument, WalletTransaction, WalletTransactionDocument, WalletTransactionType } from './schemas/wallet.schema';

@Injectable()
export class WalletService {
    constructor(
        @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
        @InjectModel(WalletTransaction.name) private walletTransactionModel: Model<WalletTransactionDocument>,
    ) { }

    async getBalance(userId: string): Promise<WalletDocument> {
        let wallet = await this.walletModel.findOne({ user: userId });
        if (!wallet) {
            wallet = await this.createWallet(userId) as any;
        }
        return wallet as WalletDocument;
    }

    async createWallet(userId: string): Promise<WalletDocument> {
        const existing = await this.walletModel.findOne({ user: userId });
        if (existing) return existing as WalletDocument;
        return (await this.walletModel.create({ user: userId })) as any as WalletDocument;
    }

    async credit(userId: string, amount: number, description: string, orderId?: string): Promise<WalletDocument> {
        const wallet = await this.getBalance(userId);

        wallet.balance += amount;
        await wallet.save();

        await this.walletTransactionModel.create({
            wallet: wallet._id,
            type: WalletTransactionType.CREDIT,
            amount,
            description,
            order: orderId ? new Types.ObjectId(orderId) : undefined,
        });

        return wallet;
    }

    async debit(userId: string, amount: number, description: string): Promise<WalletDocument> {
        const wallet = await this.getBalance(userId);

        if (wallet.balance < amount) {
            throw new BadRequestException('Insufficient funds');
        }

        wallet.balance -= amount;
        await wallet.save();

        await this.walletTransactionModel.create({
            wallet: wallet._id,
            type: WalletTransactionType.DEBIT,
            amount,
            description,
        });

        return wallet;
    }
}
