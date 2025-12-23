
import React, { useState } from 'react';
import { Shield, Key, Smartphone, LogOut } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export const SecuritySettings: React.FC = () => {
    const { logout } = useAuth();
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }
        try {
            await api.patch('/auth/change-password', {
                currentPassword: passwordData.current,
                newPassword: passwordData.new
            });
            toast.success("Mot de passe mis à jour");
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (err) {
            toast.error("Erreur lors du changement de mot de passe");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                    <Key className="w-5 h-5 text-primary-600" />
                    Mot de passe
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe actuel</label>
                        <input
                            type="password"
                            required
                            value={passwordData.current}
                            onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
                        <input
                            type="password"
                            required
                            value={passwordData.new}
                            onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le nouveau mot de passe</label>
                        <input
                            type="password"
                            required
                            value={passwordData.confirm}
                            onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>
                    <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                        Mettre à jour
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                    <Shield className="w-5 h-5 text-primary-600" />
                    Double Authentification (2FA)
                </h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold dark:text-white">Authentification par application</h3>
                            <p className="text-sm text-gray-500">Sécurisez votre compte avec Google Authenticator ou Authy.</p>
                        </div>
                    </div>
                    <button className="text-primary-600 font-medium hover:text-primary-700">Configurer</button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
                    <LogOut className="w-5 h-5 text-red-600" />
                    Sessions Actives
                </h2>
                <p className="text-sm text-gray-500 mb-4">Gérez les appareils connectés à votre compte.</p>
                <button
                    onClick={logout}
                    className="w-full py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10 transition-colors font-medium"
                >
                    Se déconnecter de tous les appareils
                </button>
            </div>
        </div>
    );
};
