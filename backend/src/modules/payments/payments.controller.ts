import { Controller, Post, Body, UseGuards, Get, Param, Res, NotFoundException, ForbiddenException, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InvoicingService } from './services/invoicing.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { AccessTokenGuard } from '../auth/guards/at.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly invoicingService: InvoicingService,
    ) { }

    @Post('initiate')
    @UseGuards(AccessTokenGuard)
    initiate(@Body() dto: InitiatePaymentDto, @GetUser('sub') userId: string) {
        return this.paymentsService.initiatePayment(userId, dto);
    }

    @Public()
    @Post('webhook')
    webhook(@Body() payload: any) {
        // In real scenario, verify signature from headers
        return this.paymentsService.handleWebhook(payload);
    }

    @Get('invoices/:id/download')
    @UseGuards(AccessTokenGuard)
    async downloadInvoice(@Param('id') id: string, @GetUser('sub') userId: string, @Res() res: Response) {
        const invoice = await this.invoicingService.findById(id);
        if (!invoice) throw new NotFoundException('Invoice not found');

        // Check ownership (Buyer or Seller)
        if (invoice.buyer.toString() !== userId && invoice.seller.toString() !== userId) {
            throw new ForbiddenException('Access denied');
        }

        // stored pdfUrl is relative web url: /invoices/yyyy/mm/file.pdf
        const relativePath = invoice.pdfUrl.replace('/invoices/', ''); // 2025/12/INV...
        const invoiceDir = path.resolve(__dirname, '..', '..', '..', '..', 'invoices');
        const filePath = path.join(invoiceDir, relativePath);

        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('Invoice file missing on disk at ' + filePath);
        }

        res.download(filePath, `Facture-${invoice.invoiceNumber}.pdf`);
    }
}
