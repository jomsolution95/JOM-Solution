import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class MessagingService {
    constructor(
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    ) { }

    async createConversation(createConversationDto: CreateConversationDto, userId: string): Promise<Conversation> {
        const participants = [...new Set([...createConversationDto.participants, userId])].map(id => new Types.ObjectId(id));

        // Check for existing private conversation (2 participants)
        if (participants.length === 2 && !createConversationDto.name) {
            const existing = await this.conversationModel.findOne({
                participants: { $all: participants, $size: 2 },
                name: { $exists: false }
            });
            if (existing) return existing;
        }

        const conversation = new this.conversationModel({
            participants,
            name: createConversationDto.name,
            admins: [new Types.ObjectId(userId)],
        });

        const savedConversation = await conversation.save();

        if (createConversationDto.initialMessage) {
            await this.sendMessage(userId, {
                conversationId: savedConversation._id.toString(),
                content: createConversationDto.initialMessage,
            });
        }

        return savedConversation;
    }

    async getUserConversations(userId: string, paginationDto: PaginationDto): Promise<any> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const conversations = await this.conversationModel.find({
            participants: new Types.ObjectId(userId)
        })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('participants', 'email phone isVerified')
            .populate('lastMessage')
            .exec();

        const total = await this.conversationModel.countDocuments({ participants: new Types.ObjectId(userId) });

        return { data: conversations, total, page, limit };
    }

    async getMessages(conversationId: string, paginationDto: PaginationDto, userId: string): Promise<any> {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');

        const isParticipant = conversation.participants.some(p => p.toString() === userId);
        if (!isParticipant) throw new ForbiddenException('Access denied');

        const { page = 1, limit = 20 } = paginationDto;
        const skip = (page - 1) * limit;

        const messages = await this.messageModel.find({ conversation: conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'email')
            .populate('seenBy', 'email')
            .exec();

        const total = await this.messageModel.countDocuments({ conversation: conversationId });

        return { data: messages, total, page, limit };
    }

    async sendMessage(senderId: string, sendMessageDto: SendMessageDto): Promise<Message> {
        const conversation = await this.conversationModel.findById(sendMessageDto.conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');

        const isParticipant = conversation.participants.some(p => p.toString() === senderId);
        if (!isParticipant) throw new ForbiddenException('You are not a participant in this conversation');

        const message = new this.messageModel({
            conversation: conversation._id,
            sender: senderId,
            content: sendMessageDto.content,
            attachments: sendMessageDto.attachments,
            seenBy: [senderId],
        });

        const savedMessage = await message.save();

        // Update conversation last message
        await this.conversationModel.findByIdAndUpdate(conversation._id, {
            lastMessage: savedMessage._id,
            updatedAt: new Date()
        });

        return savedMessage.populate('sender', 'email');
    }

    async markAsSeen(conversationId: string, userId: string): Promise<void> {
        await this.messageModel.updateMany(
            { conversation: conversationId, seenBy: { $ne: userId } },
            { $addToSet: { seenBy: userId } }
        );
    }
}
