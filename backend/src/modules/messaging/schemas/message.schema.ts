import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type MessageDocument = Message & Document;

import { Conversation } from './conversation.schema';

@Schema({ timestamps: true })
export class Message {
    @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
    conversation!: Conversation;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    sender!: User;

    @Prop({ required: true })
    content!: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
    seenBy?: User[];

    @Prop({ type: [String] })
    attachments?: string[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ receiver: 1, isRead: 1 });
