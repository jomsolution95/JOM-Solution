import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

interface UseRealtimeOptions {
    autoConnect?: boolean;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
}

interface UseRealtimeReturn {
    socket: Socket | null;
    isConnected: boolean;
    emit: (event: string, data?: any) => void;
    on: (event: string, callback: (...args: any[]) => void) => void;
    off: (event: string, callback?: (...args: any[]) => void) => void;
    connect: () => void;
    disconnect: () => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export const useRealtime = (options: UseRealtimeOptions = {}): UseRealtimeReturn => {
    const { autoConnect = true, onConnect, onDisconnect, onError } = options;
    const { user, isAuthenticated } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    // Initialize socket connection
    useEffect(() => {
        if (!isAuthenticated || !user) {
            // Disconnect if user logs out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        if (!autoConnect) return;

        // Create socket connection
        const token = localStorage.getItem('access_token');

        const socket = io(SOCKET_URL, {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: maxReconnectAttempts,
        });

        socketRef.current = socket;

        // Connection event handlers
        socket.on('connect', () => {
            console.log('✅ WebSocket connected:', socket.id);
            setIsConnected(true);
            reconnectAttempts.current = 0;
            onConnect?.();
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            setIsConnected(false);
            onDisconnect?.();
        });

        socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error.message);
            reconnectAttempts.current += 1;

            if (reconnectAttempts.current >= maxReconnectAttempts) {
                toast.error('Unable to connect to real-time server. Please refresh the page.');
            }

            onError?.(error);
        });

        socket.on('error', (error) => {
            console.error('❌ WebSocket error:', error);
            toast.error('Real-time connection error');
            onError?.(error);
        });

        // Cleanup on unmount
        return () => {
            if (socket) {
                socket.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
    }, [isAuthenticated, user, autoConnect, onConnect, onDisconnect, onError]);

    // Emit event
    const emit = useCallback((event: string, data?: any) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(event, data);
        } else {
            console.warn('Cannot emit event: Socket not connected');
        }
    }, [isConnected]);

    // Subscribe to event
    const on = useCallback((event: string, callback: (...args: any[]) => void) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    }, []);

    // Unsubscribe from event
    const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
        if (socketRef.current) {
            if (callback) {
                socketRef.current.off(event, callback);
            } else {
                socketRef.current.off(event);
            }
        }
    }, []);

    // Manual connect
    const connect = useCallback(() => {
        if (socketRef.current && !isConnected) {
            socketRef.current.connect();
        }
    }, [isConnected]);

    // Manual disconnect
    const disconnect = useCallback(() => {
        if (socketRef.current && isConnected) {
            socketRef.current.disconnect();
        }
    }, [isConnected]);

    return {
        socket: socketRef.current,
        isConnected,
        emit,
        on,
        off,
        connect,
        disconnect,
    };
};

// Hook for real-time messaging
export const useRealtimeMessages = (conversationId?: string) => {
    const { on, off, emit, isConnected } = useRealtime();
    const [newMessage, setNewMessage] = useState<any>(null);

    useEffect(() => {
        if (!conversationId || !isConnected) return;

        // Join conversation room
        emit('joinConversation', { conversationId });

        // Listen for new messages
        const handleNewMessage = (message: any) => {
            console.log('📨 New message received:', message);
            setNewMessage(message);
        };

        on('newMessage', handleNewMessage);

        // Cleanup
        return () => {
            emit('leaveConversation', { conversationId });
            off('newMessage', handleNewMessage);
        };
    }, [conversationId, isConnected, on, off, emit]);

    const sendMessage = useCallback((content: string) => {
        if (!conversationId) return;

        emit('sendMessage', {
            conversationId,
            content,
        });
    }, [conversationId, emit]);

    return {
        newMessage,
        sendMessage,
        isConnected,
    };
};

// Hook for real-time notifications
export const useRealtimeNotifications = () => {
    const { on, off, isConnected } = useRealtime();
    const [newNotification, setNewNotification] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!isConnected) return;

        // Listen for new notifications
        const handleNewNotification = (notification: any) => {
            console.log('🔔 New notification received:', notification);
            setNewNotification(notification);
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            toast.info(notification.message || 'New notification', {
                autoClose: 5000,
            });
        };

        // Listen for unread count updates
        const handleUnreadCount = (count: number) => {
            setUnreadCount(count);
        };

        on('notification', handleNewNotification);
        on('unreadCount', handleUnreadCount);

        // Request initial unread count
        // emit('getUnreadCount');

        // Cleanup
        return () => {
            off('notification', handleNewNotification);
            off('unreadCount', handleUnreadCount);
        };
    }, [isConnected, on, off]);

    const markAsRead = useCallback((notificationId: string) => {
        // This will be handled by API call, but we can optimistically update
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    return {
        newNotification,
        unreadCount,
        markAsRead,
        isConnected,
    };
};
