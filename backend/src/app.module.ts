import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { ServicesModule } from './modules/services/services.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { EscrowModule } from './modules/escrow/escrow.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MessagingModule } from './modules/messaging/messaging.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { GlobalCacheModule } from './common/cache/cache.module';
import { BullModule } from '@nestjs/bullmq';
import { AuditModule } from './common/audit/audit.module';
import { LoggerModule } from './common/logger/logger.module';
import { PremiumModule } from './modules/premium/premium.module';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AdsModule } from './modules/ads/ads.module';
import { CouponsModule } from './modules/admin/coupons.module';
import { LoggingInterceptor } from './common/logger/logging.interceptor';
import { CvModule } from './modules/cv/cv.module';
import { AiModule } from './modules/ai/ai.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    /*
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            connection: {
              host: configService.get('REDIS_HOST', 'localhost'),
              port: configService.get('REDIS_PORT', 6379),
            },
          }),
          inject: [ConfigService],
        }),
    */
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    AuthModule,
    UsersModule,
    ProfilesModule,
    JobsModule,
    ApplicationsModule,
    ServicesModule,
    OrdersModule,
    PaymentsModule,
    EscrowModule,
    MessagingModule,
    NotificationsModule,
    AdminModule,
    GlobalCacheModule,
    AuditModule,
    LoggerModule,
    PremiumModule,
    HealthModule,
    MetricsModule,

    AdsModule,
    CouponsModule,
    CvModule,
    CvModule,
    AiModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    }
  ],
})
export class AppModule { }
