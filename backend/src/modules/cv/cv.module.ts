import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { Cv, CvSchema } from './schemas/cv.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Cv.name, schema: CvSchema }]),
    ],
    controllers: [CvController],
    providers: [CvService],
    exports: [CvService],
})
export class CvModule { }
