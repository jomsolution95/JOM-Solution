import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import * as fs from 'fs';
import * as path from 'path';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';
import { Order } from '../../services/schemas/order.schema';
import { Transaction } from '../../services/schemas/transaction.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvoicingService {
    private readonly logger = new Logger(InvoicingService.name);
    private invoiceDir: string;

    constructor(
        @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
        private configService: ConfigService,
    ) {
        // Resolve path to backend/invoices
        this.invoiceDir = path.resolve(__dirname, '..', '..', '..', '..', 'invoices');
        if (!fs.existsSync(this.invoiceDir)) {
            fs.mkdirSync(this.invoiceDir, { recursive: true });
        }
    }

    async generateInvoice(order: any, transaction: any): Promise<Invoice> {
        try {
            // 1. Generate Invoice Number
            const invoiceNumber = await this.generateInvoiceNumber();

            // 2. Prepare Data
            const items = [{
                title: order.service?.title || 'Service JOM',
                quantity: 1,
                unitPrice: order.amount,
            }];
            const subtotal = order.amount;
            const feePercentage = 0.10; // 10% Platform Fee
            const fees = Math.round(subtotal * feePercentage);
            const total = subtotal + fees;

            // 3. Create PDF
            const year = new Date().getFullYear().toString();
            const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
            const relativePath = path.join(year, month);
            const absolutePath = path.join(this.invoiceDir, relativePath);

            if (!fs.existsSync(absolutePath)) {
                fs.mkdirSync(absolutePath, { recursive: true });
            }

            const filename = `${invoiceNumber}.pdf`;
            const filePath = path.join(absolutePath, filename);
            const webUrl = `/invoices/${year}/${month}/${filename}`; // Served via separate static serve or controller

            await this.createPdfInternal({
                invoiceNumber,
                date: new Date(),
                buyer: order.buyer,
                seller: order.seller,
                items,
                subtotal,
                fees,
                total,
            }, filePath);

            // 4. Save to DB
            const invoice = new this.invoiceModel({
                invoiceNumber,
                order: order._id,
                transaction: transaction._id,
                buyer: order.buyer._id,
                seller: order.seller._id,
                items,
                subtotal,
                fees,
                total,
                pdfUrl: webUrl,
                status: 'PAID',
            });

            return await invoice.save();

        } catch (error) {
            this.logger.error(`Failed to generate invoice for Order ${order._id}`, error);
            throw error;
        }
    }

    private async generateInvoiceNumber(): Promise<string> {
        const year = new Date().getFullYear();
        // Check last invoice of the year
        const lastInvoice = await this.invoiceModel.findOne({
            invoiceNumber: { $regex: new RegExp(`^INV-${year}-`) }
        }).sort({ createdAt: -1 });

        let sequence = 1;
        if (lastInvoice) {
            const parts = lastInvoice.invoiceNumber.split('-');
            const lastSeq = parseInt(parts[2]);
            if (!isNaN(lastSeq)) sequence = lastSeq + 1;
        }

        return `INV-${year}-${sequence.toString().padStart(5, '0')}`;
    }

    private createPdfInternal(data: any, filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('FACTURE', { align: 'right' });
            doc.fontSize(10).text(data.invoiceNumber, { align: 'right' });
            doc.text(new Date(data.date).toLocaleDateString('fr-FR'), { align: 'right' });

            doc.moveDown();

            // Company Info (JOM)
            doc.fontSize(14).text('JOM Solution', { align: 'left' });
            doc.fontSize(10).text('Dakar, Sénégal');
            doc.text('Email: contact@jom-solution.com');
            doc.moveDown();

            // Client Info
            doc.text(`Client: ${data.buyer.email}`); // Should ideally be Name
            doc.moveDown();

            // Table Header
            const tableTop = 250;
            doc.font('Helvetica-Bold');
            doc.text('Description', 50, tableTop);
            doc.text('Quantité', 300, tableTop, { width: 90, align: 'right' });
            doc.text('Prix Unitaire', 400, tableTop, { width: 90, align: 'right' });
            doc.text('Total', 500, tableTop, { width: 90, align: 'right' });

            // Table Rows
            doc.font('Helvetica');
            let position = tableTop + 30;
            data.items.forEach((item: any) => {
                doc.text(item.title, 50, position);
                doc.text(item.quantity.toString(), 300, position, { width: 90, align: 'right' });
                doc.text(item.unitPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }), 400, position, { width: 90, align: 'right' });
                doc.text((item.quantity * item.unitPrice).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }), 500, position, { width: 90, align: 'right' });
                position += 20;
            });

            // Totals
            position += 20;
            doc.font('Helvetica-Bold');
            doc.text('Total', 400, position, { width: 90, align: 'right' });
            doc.text(data.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }), 500, position, { width: 90, align: 'right' });

            // Footer
            doc.fontSize(8).text('Merci de votre confiance. Cette facture est générée électroniquement.', 50, 700, { align: 'center', width: 500 });


            doc.end();
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    }

    // API to find invoices
    async findByBuyer(buyerId: string) {
        return this.invoiceModel.find({ buyer: buyerId }).sort({ createdAt: -1 });
    }

    async findBySeller(sellerId: string) {
        return this.invoiceModel.find({ seller: sellerId }).sort({ createdAt: -1 });
    }

    async findById(id: string): Promise<InvoiceDocument | null> {
        return this.invoiceModel.findById(id);
    }
}
