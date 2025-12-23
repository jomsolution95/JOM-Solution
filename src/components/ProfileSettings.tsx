
import React, { useState, useEffect } from 'react';
import { User, Mail, Bell, Briefcase } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-toastify';

export const ProfileSettings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        communications: { messagePermission: 'everyone' },
        notifications: {
            email: { messages: true, jobs: true, news: true },
            push: { messages: true, jobs: true }
        }
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get('/users/me/settings');
            const data = res.data || {};
            setSettings({
                communications: {
                    messagePermission: data.communications?.messagePermission || 'everyone'
                },
                notifications: {
                    email: { ...{ messages: true, jobs: true, news: true }, ...(data.notifications?.email || {}) },
                    push: { ...{ messages: true, jobs: true }, ...(data.notifications?.push || {}) }
                }
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (section: string, key: string, value: any) => {
        try {
            const newSettings = { ...settings };
            if (section === 'communications') {
                // @ts-ignore
                newSettings.communications[key] = value;
            } else if (section === 'notifications.email') {
                // @ts-ignore
                newSettings.notifications.email[key] = value;
            } else if (section === 'notifications.push') {
                // @ts-ignore
                newSettings.notifications.push[key] = value;
            }

            setSettings(newSettings);
            await api.patch('/users/me/settings', {
                communications: newSettings.communications,
                notifications: newSettings.notifications
            });
            toast.success('Préférences mises à jour');
        } catch (err) {
            toast.error('Erreur de sauvegarde');
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="space-y-6">
            {/* Communication Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                    <User className="w-5 h-5 text-primary-600" />
                    Interactions
                </h2>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                        <h3 className="font-medium dark:text-white">Qui peut vous envoyer des messages ?</h3>
                        <p className="text-sm text-gray-500">Gérez qui peut démarrer une conversation avec vous.</p>
                    </div>
                    <select
                        value={settings.communications.messagePermission}
                        onChange={(e) => updateSetting('communications', 'messagePermission', e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                    >
                        <option value="everyone">Tout le monde</option>
                        <option value="connections">Mes connexions uniquement</option>
                        <option value="none">Personne</option>
                    </select>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                    <Bell className="w-5 h-5 text-primary-600" />
                    Notifications
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2 dark:text-white">
                            <Mail className="w-4 h-4" /> Email
                        </h3>
                        <div className="space-y-3">
                            {[
                                { k: 'messages', l: 'Nouveaux messages' },
                                { k: 'jobs', l: 'Offres d\'emploi' },
                                { k: 'news', l: 'Actualités JOM' }
                            ].map(({ k, l }) => (
                                <label key={k} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        // @ts-ignore
                                        checked={settings.notifications.email[k]}
                                        // @ts-ignore
                                        onChange={(e) => updateSetting('notifications.email', k, e.target.checked)}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{l}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2 dark:text-white">
                            <Bell className="w-4 h-4" /> Push / Mobile
                        </h3>
                        <div className="space-y-3">
                            {[
                                { k: 'messages', l: 'Nouveaux messages' },
                                { k: 'jobs', l: 'Offres d\'emploi' }
                            ].map(({ k, l }) => (
                                <label key={k} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        // @ts-ignore
                                        checked={settings.notifications.push[k]}
                                        // @ts-ignore
                                        onChange={(e) => updateSetting('notifications.push', k, e.target.checked)}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{l}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
