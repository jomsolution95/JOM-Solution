import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'notifications',
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }

            const secret = this.configService.get<string>('JWT_SECRET');
            const payload = this.jwtService.verify(token, { secret });
            const userId = payload.sub;

            // Join user to their personal room
            client.join(`user_${userId}`);
            console.log(`Notification Client connected: ${client.id}, User: ${userId}`);
        } catch (e) {
            console.error('Connection unauthorized', e);
            console.log('Token that failed:', client.handshake.auth.token || 'No token');
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        // client automatically leaves rooms on disconnect
        console.log(`Notification Client disconnected: ${client.id}`);
    }

    // Method to emit notification to valid room
    emitNotification(userId: string, notification: any) {
        this.server.to(`user_${userId}`).emit('notification', notification);
    }
}
