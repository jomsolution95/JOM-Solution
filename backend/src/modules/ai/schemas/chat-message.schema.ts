
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: true })
export class ChatMessage {
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true, enum: ['user', 'assistant'] })
    role: string;

    @Prop({ required: true })
    content: string;

    @Prop({ type: Object })
    metadata?: any;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
ChatMessageSchema.index({ userId: 1, createdAt: 1 });
