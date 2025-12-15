import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SchedulerService } from './scheduler.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Escrow, EscrowSchema } from '../services/schemas/escrow.schema';
import { Order, OrderSchema } from '../services/schemas/order.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { ScheduledTask, ScheduledTaskSchema } from './schemas/scheduled-task.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdsModule } from '../ads/ads.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Escrow.name, schema: EscrowSchema },
      { name: Order.name, schema: OrderSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: ScheduledTask.name, schema: ScheduledTaskSchema }
    ]),
    NotificationsModule,
    AdsModule
  ],
  controllers: [AdminController],
  providers: [AdminService, SchedulerService],
  exports: [AdminService, SchedulerService]
})
export class AdminModule { }
