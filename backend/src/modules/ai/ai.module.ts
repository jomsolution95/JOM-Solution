import { MongooseModule } from '@nestjs/mongoose';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { AiSchedulerService } from './ai.scheduler.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { Application, ApplicationSchema } from '../jobs/schemas/application.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ChatMessage.name, schema: ChatMessageSchema },
            { name: User.name, schema: UserSchema },
            { name: Job.name, schema: JobSchema },
            { name: Application.name, schema: ApplicationSchema },
        ])
    ],
    controllers: [AiController],
    providers: [AiService, AiSchedulerService],
})
export class AiModule { }
