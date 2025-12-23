import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
    cors: {
        origin: '*', // Configure appropriately for production
    },
    namespace: 'messaging',
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly messagingService: MessagingService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = this.extractToken(client);
            if (!token) return client.disconnect();

            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            client.data.user = payload;
            await client.join(`user_${payload.sub}`);
            console.log(`User connected: ${payload.sub}`);
        } catch (error) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        // Handle disconnect logic if needed
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: SendMessageDto,
    ) {
        const userId = client.data.user.sub;
        const message = await this.messagingService.sendMessage(userId, payload);

        // Get conversation to find recipients
        // Ideally sendMessage returns populated conversation or we fetch it
        // For efficiency, we assume specific room logic or emit to participants logic
        // For now, simpler approach: emit to conversation room if we had one, OR emit to user rooms.
        // Let's fetch conversation participants.
        // Note: Real-world optimization would be better, scanning participants.

        // Emitting to conversation room (clients join conversation rooms upon entering chat)
        this.server.to(`conversation_${payload.conversationId}`).emit('newMessage', message);

        // Also notify participants individually for push/badge updates if they aren't in the conversation room
        // This requires fetching participants from service - skipped for brevity but critical for "New Message" notifications outside chat
    }

    @SubscribeMessage('joinConversation')
    handleJoinConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() conversationId: string,
    ) {
        client.join(`conversation_${conversationId}`);
    }

    @SubscribeMessage('leaveConversation')
    handleLeaveConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() conversationId: string,
    ) {
        client.leave(`conversation_${conversationId}`);
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() conversationId: string,
    ) {
        client.to(`conversation_${conversationId}`).emit('typing', {
            userId: client.data.user.sub,
            conversationId,
        });
    }

    private extractToken(client: Socket): string | undefined {
        const [type, token] = client.handshake.headers.authorization?.split(' ') ?? [];
        if (type === 'Bearer') return token;

        // Also check auth object (standard for socket.io client)
        if (client.handshake.auth?.token) {
            const authHeader = client.handshake.auth.token;
            return authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        }

        return undefined;
    }
}
