import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Order, OrderSchema } from '../services/schemas/order.schema';
import { AdminAuditLog, AdminAuditLogSchema } from './schemas/audit-log.schema';
import { IdentityVerification, IdentityVerificationSchema } from '../premium/schemas/identityVerification.schema';
import { Escrow, EscrowSchema } from '../services/schemas/escrow.schema';
import { AdsModule } from '../ads/ads.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SchedulerService } from './scheduler.service';
import { ScheduledTask, ScheduledTaskSchema } from './schemas/scheduled-task.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: AdminAuditLog.name, schema: AdminAuditLogSchema },
      { name: IdentityVerification.name, schema: IdentityVerificationSchema },
      { name: Escrow.name, schema: EscrowSchema },
      { name: ScheduledTask.name, schema: ScheduledTaskSchema },
      // { name: Report.name, schema: ReportSchema },
    ]),
    AdsModule, // Import AdsModule for AdsService
    NotificationsModule, // Import NotificationsModule for NotificationsService
  ],
  controllers: [AdminController],
  providers: [AdminService, SchedulerService],
  exports: [AdminService],
})
export class AdminModule { }
