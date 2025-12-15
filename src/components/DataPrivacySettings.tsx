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

            toast.success('Données téléchargées avec succès !');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Échec du téléchargement des données');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'SUPPRIMER MON COMPTE') {
            toast.error('Veuillez saisir le texte de confirmation correctement');
            return;
        }

        setIsDeleting(true);

        try {
            await api.delete('/users/account');
            toast.success('Compte supprimé avec succès');

            // Logout and redirect
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Échec de la suppression du compte');
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
                            Télécharger vos données
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Téléchargez une copie de toutes vos données conformément au RGPD. Cela inclut vos informations de profil, publications, messages et historique d'activité.
                        </p>

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Ce qui est inclus :
                            </h3>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-6 list-disc">
                                <li>Informations de profil (nom, email, téléphone, bio)</li>
                                <li>Toutes vos publications et commentaires</li>
                                <li>Messages et conversations</li>
                                <li>Candidatures et services</li>
                                <li>Historique des paiements et factures</li>
                                <li>Journaux d'activité du compte</li>
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
                                    Préparation du téléchargement...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Télécharger mes données
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
                            Supprimer le compte
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Supprimez définitivement votre compte et toutes les données associées. Cette action est irréversible.
                        </p>

                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                                        Attention : Cette action est irréversible
                                    </h3>
                                    <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-6 list-disc">
                                        <li>Toutes vos données seront définitivement supprimées</li>
                                        <li>Vous perdrez l'accès à tous les services et abonnements</li>
                                        <li>Votre profil sera retiré de la plateforme</li>
                                        <li>Les commandes et paiements actifs seront annulés</li>
                                        <li>Cette action ne peut pas être annulée</li>
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
                                Supprimer mon compte
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tapez <span className="font-mono font-bold">SUPPRIMER MON COMPTE</span> pour confirmer
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        placeholder="SUPPRIMER MON COMPTE"
                                        className="w-full px-4 py-3 rounded-lg border-2 border-red-300 dark:border-red-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting || deleteConfirmText !== 'SUPPRIMER MON COMPTE'}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Suppression...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-5 h-5" />
                                                Confirmer la suppression
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
                                        Annuler
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
