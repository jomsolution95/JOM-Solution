import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Message } from './message.schema';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
    participants!: User[];

    @Prop({ type: Types.ObjectId, ref: 'Message' })
    lastMessage?: Message;

    // Optional: for group chats
    @Prop()
    name?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    admins?: User[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ participants: 1 });
