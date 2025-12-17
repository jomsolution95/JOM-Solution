
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { PremiumModule } from '../premium/premium.module';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { NotificationsModule } from '../notifications/notifications.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      { name: Job.name, schema: JobSchema }
    ]),
    PremiumModule,
    NotificationsModule
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService]
})
export class ApplicationsModule { }
