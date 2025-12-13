import React, { useState, useEffect } from 'react';
import { X, Bell, Check, Briefcase, MessageSquare, ShoppingCart, CreditCard, UserPlus, ExternalLink, Trash2 } from 'lucide-react';
import { useRealtimeNotifications } from '../hooks/useRealtime';
import { useNotifications, useNotificationCount } from '../hooks/useApi';
import { notificationsApi } from '../api/services';
import { formatDistanceToNow } from 'date-fns';

export interface Notification {
    _id: string;
    type: 'application' | 'message' | 'order' | 'payment' | 'follower' | 'system';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    metadata?: {
        userId?: string;
        jobId?: string;
        orderId?: string;
        amount?: number;
        [key: string]: any;
    };
}

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const notificationIcons = {
    application: Briefcase,
    message: MessageSquare,
    order: ShoppingCart,
    payment: CreditCard,
    follower: UserPlus,
    system: Bell,
};

const notificationColors = {
    application: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    message: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    order: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    payment: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    follower: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    system: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
};

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const { data: notificationsData, isLoading, refetch } = useNotifications();
    const { newNotification, unreadCount } = useRealtimeNotifications();

    // Refetch when new notification arrives via WebSocket
    useEffect(() => {
        if (newNotification) {
            refetch();
        }
    }, [newNotification, refetch]);

    const notifications: Notification[] = notificationsData?.data || [];

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationsApi.markAsRead(id);
            refetch();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
            await Promise.all(unreadIds.map(id => notificationsApi.markAsRead(id)));
            refetch();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // Implement delete API call
            // await notificationsApi.delete(id);
            refetch();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getNotificationLink = (notification: Notification): string => {
        const { type, metadata } = notification;

        switch (type) {
            case 'application':
                return metadata?.jobId ? `/jobs/${metadata.jobId}` : '/jobs';
            case 'message':
                return '/messages';
            case 'order':
                return metadata?.orderId ? `/orders/${metadata.orderId}` : '/my-items';
            case 'payment':
                return '/billing';
            case 'follower':
                return metadata?.userId ? `/profile/${metadata.userId}` : '/reseaux';
            default:
                return '/dashboard';
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary-600" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Notifications
                        </h2>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'unread'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                            <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                {filter === 'unread'
                                    ? "You're all caught up!"
                                    : "We'll notify you when something happens"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {filteredNotifications.map((notification) => {
                                const Icon = notificationIcons[notification.type];
                                const colorClass = notificationColors[notification.type];
                                const link = getNotificationLink(notification);

                                return (
                                    <div
                                        key={notification._id}
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {notification.title}
                                                    </h3>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                                                    <span>
                                                        {formatDistanceToNow(new Date(notification.createdAt), {
                                                            addSuffix: true,
                                                        })}
                                                    </span>
                                                    {link && (
                                                        <a
                                                            href={link}
                                                            onClick={onClose}
                                                            className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                                                        >
                                                            View
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification._id)}
                                                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="w-4 h-4 text-gray-500" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification._id)}
                                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
