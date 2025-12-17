import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { Training, TrainingSchema } from '../premium/schemas/training.schema';
import { Profile, ProfileSchema } from '../users/schemas/profile.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Profile.name, schema: ProfileSchema },
            { name: Job.name, schema: JobSchema },
            { name: Service.name, schema: ServiceSchema },
            { name: Training.name, schema: TrainingSchema },
        ]),
    ],
    controllers: [SearchController],
    providers: [SearchService],
    exports: [SearchService],
})
export class SearchModule { }
