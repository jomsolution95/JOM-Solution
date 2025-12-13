import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('wallet')
@UseGuards(AccessTokenGuard)
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get('balance')
    async getBalance(@GetUser('sub') userId: string) {
        const wallet = await this.walletService.getBalance(userId);
        return {
            balance: wallet.balance,
            currency: wallet.currency
        };
    }

    @Post('withdraw')
    async withdraw(@GetUser('sub') userId: string, @Body() body: { amount: number; provider: string; phone: string }) {
        if (!body.amount || body.amount <= 0) throw new BadRequestException('Invalid amount');

        // This is a simplified withdrawal. In reality, we would integrate PayTech Payout API here.
        // For now, we debit the wallet and log the transaction.

        const wallet = await this.walletService.debit(
            userId,
            body.amount,
            `Withdrawal request via ${body.provider} to ${body.phone}`
        );

        return {
            status: 'success',
            message: 'Withdrawal processed successfully',
            new_balance: wallet.balance
        };
    }
}
