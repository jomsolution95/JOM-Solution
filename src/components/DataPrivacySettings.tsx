
import React, { useState, useEffect } from 'react';
import { Lock, Eye, Users, FileText, Download } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-toastify';

export const DataPrivacySettings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        profileVisibility: 'public',
        ghostMode: false,
        blockedUsers: [] as string[]
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get('/users/me/settings');
            const privacy = res.data?.privacy || {};
            setSettings({
                profileVisibility: privacy.profileVisibility || 'public',
                ghostMode: privacy.ghostMode || false,
                blockedUsers: privacy.blockedUsers || []
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key: string, value: any) => {
        try {
            const newSettings = { ...settings, [key]: value };
            setSettings(newSettings);
            await api.patch('/users/me/settings', {
                privacy: newSettings
            });
            toast.success('Paramètres mis à jour');
        } catch (err) {
            toast.error('Erreur lors de la mise à jour');
            console.error(err);
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                    <Eye className="w-5 h-5 text-primary-600" />
                    Visibilité du Profil
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div>
                            <h3 className="font-medium dark:text-white">Qui peut voir votre profil ?</h3>
                            <p className="text-sm text-gray-500">Contrôlez l'accès à vos informations personnelles.</p>
                        </div>
                        <select
                            value={settings.profileVisibility}
                            onChange={(e) => updateSetting('profileVisibility', e.target.value)}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                        >
                            <option value="public">Tout le monde (Public)</option>
                            <option value="connected">Membres connectés uniquement</option>
                            <option value="private">Moi uniquement (Masqué)</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div>
                            <h3 className="font-medium dark:text-white">Mode Fantôme</h3>
                            <p className="text-sm text-gray-500">Visitez d'autres profils sans apparaître dans leurs notifications de vue.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.ghostMode}
                                onChange={(e) => updateSetting('ghostMode', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                    <FileText className="w-5 h-5 text-primary-600" />
                    Vos Données
                </h2>
                <div className="space-y-4">
                    <button className="flex items-center gap-3 w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors group">
                        <Download className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                        <div>
                            <h3 className="font-medium dark:text-white">Télécharger vos données</h3>
                            <p className="text-sm text-gray-500">Recevez une copie de toutes vos données (RGPD)</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 w-full p-4 text-left hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors group">
                        <Lock className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                        <div>
                            <h3 className="font-medium group-hover:text-red-600 dark:text-white">Fermer le compte</h3>
                            <p className="text-sm text-gray-500">Désactiver ou supprimer définitivement votre compte</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
