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
            toast.error('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsChangingPassword(true);

        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            toast.success('Password changed successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleEnable2FA = async () => {
        setIsLoading2FA(true);

        try {
            const response = await api.post('/auth/2fa/enable');
            setQrCode(response.data.qrCode);
            toast.info('Scan the QR code with your authenticator app');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to enable 2FA');
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
            toast.success('2FA enabled successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid verification code');
        } finally {
            setIsLoading2FA(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!confirm('Are you sure you want to disable 2FA?')) return;

        setIsLoading2FA(true);

        try {
            await api.post('/auth/2fa/disable');
            setIs2FAEnabled(false);
            toast.success('2FA disabled successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to disable 2FA');
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
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Update your password regularly for security</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
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
                            New Password
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
                            At least 8 characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
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
                                Changing...
                            </>
                        ) : (
                            <>
                                <Key className="w-5 h-5" />
                                Change Password
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
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    {is2FAEnabled && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Enabled
                        </div>
                    )}
                </div>

                {!is2FAEnabled && !qrCode && (
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Enable 2FA to secure your account with an authenticator app like Google Authenticator or Authy.
                        </p>
                        <button
                            onClick={handleEnable2FA}
                            disabled={isLoading2FA}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
                        >
                            {isLoading2FA ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Enable 2FA
                                </>
                            )}
                        </button>
                    </div>
                )}

                {qrCode && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Scan this QR code with your authenticator app
                            </p>
                            <img src={qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
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
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Verify & Enable
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
                                Disabling...
                            </>
                        ) : (
                            'Disable 2FA'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};
