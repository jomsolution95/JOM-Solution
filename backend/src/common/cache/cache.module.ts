import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
    imports: [
        NestCacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                store: redisStore,
                host: configService.get('REDIS_HOST', 'localhost'),
                port: configService.get('REDIS_PORT', 6379),
                ttl: configService.get('CACHE_TTL', 600), // Default 10 mins
                max: 1000, // Max items in cache
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [CacheService],
    exports: [CacheService, NestCacheModule],
})
export class GlobalCacheModule { }
