import React, { useState } from 'react';
import { Lock, Shield, Key, Loader, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';

export const SecuritySettings: React.FC = () => {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isLoading2FA, setIsLoading2FA] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [qrCode, setQrCode] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState('');

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        setIsChangingPassword(true);

        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            toast.success('Mot de passe modifié avec succès !');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Échec du changement de mot de passe');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleEnable2FA = async () => {
        setIsLoading2FA(true);

        try {
            const response = await api.post('/auth/2fa/enable');
            setQrCode(response.data.qrCode);
            toast.info('Scannez le code QR avec votre application d\'authentification');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Échec de l\'activation de la 2FA');
        } finally {
            setIsLoading2FA(false);
        }
    };

    const handleVerify2FA = async () => {
        setIsLoading2FA(true);

        try {
            await api.post('/auth/2fa/verify', {
                code: verificationCode,
            });

            setIs2FAEnabled(true);
            setQrCode('');
            setVerificationCode('');
            toast.success('2FA activée avec succès !');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Code de vérification invalide');
        } finally {
            setIsLoading2FA(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!confirm('Êtes-vous sûr de vouloir désactiver la 2FA ?')) return;

        setIsLoading2FA(true);

        try {
            await api.post('/auth/2fa/disable');
            setIs2FAEnabled(false);
            toast.success('2FA désactivée avec succès');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Échec de la désactivation de la 2FA');
        } finally {
            setIsLoading2FA(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Change Password */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <Lock className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Changer le mot de passe</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Mettez à jour votre mot de passe régulièrement pour plus de sécurité</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mot de passe actuel
                        </label>
                        <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                            minLength={8}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Au moins 8 caractères
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirmer le nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
                    >
                        {isChangingPassword ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Modification...
                            </>
                        ) : (
                            <>
                                <Key className="w-5 h-5" />
                                Changer le mot de passe
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Authentification à deux facteurs</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                    </div>
                    {is2FAEnabled && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Activé
                        </div>
                    )}
                </div>

                {!is2FAEnabled && !qrCode && (
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Activez la 2FA pour sécuriser votre compte avec une application comme Google Authenticator.
                        </p>
                        <button
                            onClick={handleEnable2FA}
                            disabled={isLoading2FA}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
                        >
                            {isLoading2FA ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Chargement...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Activer la 2FA
                                </>
                            )}
                        </button>
                    </div>
                )}

                {qrCode && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Scannez ce code QR avec votre application d'authentification
                            </p>
                            <img src={qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Code de vérification
                            </label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Entrez le code à 6 chiffres"
                                maxLength={6}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                            />
                        </div>

                        <button
                            onClick={handleVerify2FA}
                            disabled={isLoading2FA || verificationCode.length !== 6}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
                        >
                            {isLoading2FA ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Vérification...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Vérifier et Activer
                                </>
                            )}
                        </button>
                    </div>
                )}

                {is2FAEnabled && (
                    <button
                        onClick={handleDisable2FA}
                        disabled={isLoading2FA}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
                    >
                        {isLoading2FA ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Désactivation...
                            </>
                        ) : (
                            'Désactiver la 2FA'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};
