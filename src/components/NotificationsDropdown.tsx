import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
}

interface NotificationsDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Fetch Notifications
    const { data, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await api.get('/notifications'); // Assumes standard CRUD
            return data.data; // data: { data: [], total: ... }
        },
        enabled: isOpen,
    });

    useEffect(() => {
        if (data) {
            setNotifications(data);
        }
    }, [data]);

    // Mark as Read Mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/notifications/${id}/read`);
        },
        onSuccess: (_, id) => {
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        }
    });

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsReadMutation.mutate(notification._id);
        }
        if (notification.link) {
            onClose();
            navigate(notification.link);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary-600" /> Notifications
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">Chargement...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                        Aucune notification pour le moment.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                    <div className="flex-1">
                                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-2">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center">
                <button className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                    Tout marquer comme lu
                </button>
            </div>
        </div>
    );
};
