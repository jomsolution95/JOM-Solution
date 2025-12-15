import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Transaction, TransactionSchema } from '../services/schemas/transaction.schema';
import { Order, OrderSchema } from '../services/schemas/order.schema';
import { EscrowModule } from '../escrow/escrow.module';
import { InvoicingService } from './services/invoicing.service';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
    forwardRef(() => EscrowModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, InvoicingService],
  exports: [PaymentsService],
})
export class PaymentsModule { }
