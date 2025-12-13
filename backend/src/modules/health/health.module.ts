import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [TerminusModule, HttpModule, MongooseModule],
    controllers: [HealthController],
})
export class HealthModule { }
