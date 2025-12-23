import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { PremiumService } from './premium.service';
import { SubscriptionService } from './services/subscription.service';
import { StripeService } from './services/stripe.service';
import { WaveService } from './services/wave.service';
import { OrangeMoneyService } from './services/orange-money.service';
import { PayTechService } from './services/paytech.service';
import { PremiumController } from './premium.controller';
import { UploadController } from './upload.controller';
import { PremiumWebhookController } from './premium-webhook.controller';
import { PremiumGuard } from './guards/premium.guard';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { PremiumQuota, PremiumQuotaSchema } from './schemas/premiumQuotas.schema';
import { Boost, BoostSchema } from './schemas/boosts.schema';
import { ProfileView, ProfileViewSchema } from './schemas/profileViews.schema';
import { CertificateTemplate, CertificateTemplateSchema } from './schemas/certificateTemplate.schema';
import { Certificate, CertificateSchema } from './schemas/certificates.schema';
import { Training, TrainingSchema } from './schemas/training.schema';
import { TrainingContent, TrainingContentSchema } from './schemas/trainingContent.schema';
import { StudentProgress, StudentProgressSchema } from './schemas/studentProgress.schema';
import { FavoriteProfile, FavoriteProfileSchema } from './schemas/favoriteProfile.schema';
import { RecruitmentPack, RecruitmentPackSchema } from './schemas/recruitmentPack.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { Application, ApplicationSchema } from '../jobs/schemas/application.schema';
import { Post, PostSchema } from './schemas/post.schema';
import { Notification, NotificationSchema } from '../notifications/schemas/notification.schema';
import { Order, OrderSchema } from '../services/schemas/order.schema';
import { Transaction, TransactionSchema } from '../services/schemas/transaction.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { BoostController } from './boost.controller';
import { CVthequeController } from './cvtheque.controller';
import { StatsController } from './stats.controller';
import { AcademyController } from './academy.controller';
import { CertificateController } from './certificate.controller';
import { CertificateTemplateController } from './certificate-template.controller';
import { JobBroadcastController } from './job-broadcast.controller';
import { RecruitmentPackController } from './recruitment-pack.controller';
import { RecruitmentPackService } from './services/recruitment-pack.service';
import { BoostService } from './services/boost.service';
import { CVthequeService } from './services/cvtheque.service';
import { StatsService } from './services/stats.service';
import { CourseService } from './services/course.service';
import { FileUploadService } from './services/file-upload.service';
import { CertificateService } from './services/certificate.service';
import { JobBroadcastService } from './services/job-broadcast.service';
import { MarketingController } from './marketing.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PostsController } from './posts.controller';
import { UsersModule } from '../users/users.module';
import { ServicesModule } from '../services/services.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MongooseModule.forFeature([
            { name: Subscription.name, schema: SubscriptionSchema },
            { name: PremiumQuota.name, schema: PremiumQuotaSchema },
            { name: Boost.name, schema: BoostSchema },
            { name: ProfileView.name, schema: ProfileViewSchema },
            { name: Certificate.name, schema: CertificateSchema },
            { name: CertificateTemplate.name, schema: CertificateTemplateSchema },
            { name: Training.name, schema: TrainingSchema },
            { name: TrainingContent.name, schema: TrainingContentSchema },
            { name: StudentProgress.name, schema: StudentProgressSchema },
            { name: FavoriteProfile.name, schema: FavoriteProfileSchema },
            { name: RecruitmentPack.name, schema: RecruitmentPackSchema },
            { name: Job.name, schema: JobSchema },
            { name: Application.name, schema: ApplicationSchema },
            { name: Post.name, schema: PostSchema },
            { name: Notification.name, schema: NotificationSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Transaction.name, schema: TransactionSchema },
            { name: User.name, schema: UserSchema },
        ]),
        NotificationsModule,
        UsersModule,
        ServicesModule,
    ],
    controllers: [
        PremiumController,
        PremiumWebhookController,
        BoostController,
        CVthequeController,
        StatsController,
        AcademyController,
        CertificateController,
        CertificateTemplateController,
        JobBroadcastController,
        MarketingController,
        PostsController,
        UploadController,
    ],
    providers: [
        PremiumService,
        SubscriptionService,
        BoostService,
        CVthequeService,
        StatsService,
        CourseService,
        FileUploadService,
        CertificateService,
        JobBroadcastService,
        RecruitmentPackService,
        StripeService,
        WaveService,
        OrangeMoneyService,
        PayTechService,
        PremiumGuard,
    ],
    exports: [PremiumService, SubscriptionService, BoostService, CVthequeService, StatsService, CourseService, CertificateService, PremiumGuard, FileUploadService, RecruitmentPackService],
})
export class PremiumModule { }
