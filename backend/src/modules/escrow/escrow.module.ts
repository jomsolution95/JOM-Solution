import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { Escrow, EscrowSchema } from '../services/schemas/escrow.schema';
import { Order, OrderSchema } from '../services/schemas/order.schema';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Escrow.name, schema: EscrowSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    WalletModule,
  ],
  controllers: [EscrowController],
  providers: [EscrowService],
  exports: [EscrowService],
})
export class EscrowModule { }
