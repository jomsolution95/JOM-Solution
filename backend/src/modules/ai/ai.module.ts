import { MongooseModule } from '@nestjs/mongoose';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { AiSchedulerService } from './ai.scheduler.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: ChatMessage.name, schema: ChatMessageSchema }])
    ],
    controllers: [AiController],
    providers: [AiService, AiSchedulerService],
})
export class AiModule { }
