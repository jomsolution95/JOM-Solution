import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async get(key: string): Promise<any> {
        return this.cacheManager.get(key);
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        // ttl in cache-manager v5 is in milliseconds usually, but it depends on store. 
        // NestJS cache-manager wrap handles it.
        await this.cacheManager.set(key, value, ttl);
    }

    async del(key: string): Promise<void> {
        await this.cacheManager.del(key);
    }
}
