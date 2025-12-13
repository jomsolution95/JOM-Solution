import React, { useState } from 'react';
import { Download, Trash2, AlertTriangle, Loader, FileText, Database } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';

export const DataPrivacySettings: React.FC = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    const handleDownloadData = async () => {
        setIsDownloading(true);

        try {
            const response = await api.get('/users/data/export', {
                responseType: 'blob',
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `my-data-${Date.now()}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Data downloaded successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to download data');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
            toast.error('Please type the confirmation text correctly');
            return;
        }

        setIsDeleting(true);

        try {
            await api.delete('/users/account');
            toast.success('Account deleted successfully');

            // Logout and redirect
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Download Data */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Download className="w-6 h-6 text-blue-600" />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Download Your Data
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Download a copy of all your data in accordance with GDPR. This includes your profile information, posts, messages, and activity history.
                        </p>

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                What's included:
                            </h3>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-6 list-disc">
                                <li>Profile information (name, email, phone, bio)</li>
                                <li>All your posts and comments</li>
                                <li>Messages and conversations</li>
                                <li>Job applications and services</li>
                                <li>Payment history and invoices</li>
                                <li>Account activity logs</li>
                            </ul>
                        </div>

                        <button
                            onClick={handleDownloadData}
                            disabled={isDownloading}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Preparing download...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Download My Data
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Account */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-red-200 dark:border-red-900">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Delete Account
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>

                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                                        Warning: This action is irreversible
                                    </h3>
                                    <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-6 list-disc">
                                        <li>All your data will be permanently deleted</li>
                                        <li>You will lose access to all services and subscriptions</li>
                                        <li>Your profile will be removed from the platform</li>
                                        <li>Active orders and payments will be cancelled</li>
                                        <li>This action cannot be undone</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                                Delete My Account
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        placeholder="DELETE MY ACCOUNT"
                                        className="w-full px-4 py-3 rounded-lg border-2 border-red-300 dark:border-red-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-5 h-5" />
                                                Confirm Delete
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setDeleteConfirmText('');
                                        }}
                                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
