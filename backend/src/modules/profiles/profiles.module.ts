import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { Profile, ProfileSchema } from '../users/schemas/profile.schema';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from '../../common/cache/cache.service';
import { PremiumModule } from '../premium/premium.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
    CacheModule.register(),
    PremiumModule
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService, CacheService],
  exports: [ProfilesService]
})
export class ProfilesModule { }
