import React, { useState, useEffect } from 'react';
import {
    Shield, Upload, CheckCircle, XCircle, Clock,
    AlertTriangle, FileText, Camera, Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';
import { BackButton } from '../components/BackButton';

interface Verification {
    _id: string;
    status: 'pending' | 'verified' | 'rejected';
    documentType: string;
    documentUrl: string;
    submittedAt: string;
    reviewedAt?: string;
    rejectionReason?: string;
    extractedData?: any;
}

const DOCUMENT_TYPES = [
    { value: 'id_card', label: 'Carte d\'identité nationale' },
    { value: 'passport', label: 'Passeport' },
    { value: 'drivers_license', label: 'Permis de conduire' },
];

export const VerifyIdentity: React.FC = () => {
    const [verification, setVerification] = useState<Verification | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [documentType, setDocumentType] = useState('id_card');
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);
    const [frontPreview, setFrontPreview] = useState<string>('');
    const [backPreview, setBackPreview] = useState<string>('');

    useEffect(() => {
        loadVerificationStatus();
    }, []);

    const loadVerificationStatus = async () => {
        try {
            const response = await api.get('/identity-verification/status');
            setVerification(response.data.verification);
        } catch (error) {
            console.error('Error loading verification:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (file: File, side: 'front' | 'back') => {
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Fichier trop volumineux (max 10MB)');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (side === 'front') {
                setFrontFile(file);
                setFrontPreview(reader.result as string);
            } else {
                setBackFile(file);
                setBackPreview(reader.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!frontFile) {
            toast.error('Veuillez sélectionner le recto du document');
            return;
        }

        setUploading(true);
        try {
            // Upload front
            const frontFormData = new FormData();
            frontFormData.append('file', frontFile);
            const frontResponse = await api.post('/identity-verification/upload', frontFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            let backUrl;
            if (backFile) {
                const backFormData = new FormData();
                backFormData.append('file', backFile);
                const backResponse = await api.post('/identity-verification/upload', backFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                backUrl = backResponse.data.url;
            }

            // Submit verification
            await api.post('/identity-verification/submit', {
                documentType,
                documentUrl: frontResponse.data.url,
                documentBackUrl: backUrl,
            });

            toast.success('Demande de vérification envoyée !');
            loadVerificationStatus();

            // Reset form
            setFrontFile(null);
            setBackFile(null);
            setFrontPreview('');
            setBackPreview('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
        } finally {
            setUploading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    icon: Clock,
                    color: 'yellow',
                    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                    textColor: 'text-yellow-700 dark:text-yellow-300',
                    label: 'En attente de vérification',
                };
            case 'verified':
                return {
                    icon: CheckCircle,
                    color: 'green',
                    bgColor: 'bg-green-100 dark:bg-green-900/30',
                    textColor: 'text-green-700 dark:text-green-300',
                    label: 'Vérifié',
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'red',
                    bgColor: 'bg-red-100 dark:bg-red-900/30',
                    textColor: 'text-red-700 dark:text-red-300',
                    label: 'Rejeté',
                };
            default:
                return {
                    icon: Shield,
                    color: 'gray',
                    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
                    textColor: 'text-gray-700 dark:text-gray-300',
                    label: 'Non vérifié',
                };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Shield className="w-12 h-12 text-primary-600 animate-pulse" />
            </div>
        );
    }

    const statusConfig = verification ? getStatusConfig(verification.status) : getStatusConfig('');
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <BackButton label="Retour" />

                {/* Header */}
                <div className="mt-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary-600" />
                        Vérification d'Identité
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Obtenez votre badge vérifié en quelques minutes
                    </p>
                </div>

                {/* Current Status */}
                {verification && (
                    <div className={`mb-8 rounded-xl p-6 ${statusConfig.bgColor} border-2 border-${statusConfig.color}-300 dark:border-${statusConfig.color}-700`}>
                        <div className="flex items-start gap-4">
                            <StatusIcon className={`w-8 h-8 ${statusConfig.textColor} flex-shrink-0`} />
                            <div className="flex-1">
                                <h3 className={`text-lg font-bold ${statusConfig.textColor} mb-2`}>
                                    {statusConfig.label}
                                </h3>

                                {verification.status === 'pending' && (
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Votre demande est en cours de traitement. Vous recevrez une notification une fois la vérification terminée.
                                    </p>
                                )}

                                {verification.status === 'verified' && (
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Votre identité a été vérifiée avec succès ! Le badge vérifié apparaît maintenant sur votre profil.
                                    </p>
                                )}

                                {verification.status === 'rejected' && (
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                            Votre demande a été rejetée pour la raison suivante :
                                        </p>
                                        <p className="text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                            {verification.rejectionReason || 'Document non conforme'}
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">
                                            Vous pouvez soumettre une nouvelle demande ci-dessous.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                                    Soumis le {new Date(verification.submittedAt).toLocaleDateString('fr-FR')}
                                    {verification.reviewedAt && (
                                        <> • Traité le {new Date(verification.reviewedAt).toLocaleDateString('fr-FR')}</>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Verification Form */}
                {(!verification || verification.status === 'rejected') && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Soumettre une demande de vérification
                        </h2>

                        {/* Info Banner */}
                        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-900 dark:text-blue-100">
                                    <p className="font-medium mb-2">Documents acceptés :</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Carte d'identité nationale (recto et verso)</li>
                                        <li>Passeport</li>
                                        <li>Permis de conduire</li>
                                    </ul>
                                    <p className="mt-3 font-medium">Assurez-vous que :</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Le document est valide et non expiré</li>
                                        <li>Toutes les informations sont lisibles</li>
                                        <li>La photo est nette et bien éclairée</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Document Type */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Type de document
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {DOCUMENT_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setDocumentType(type.value)}
                                        className={`p-4 rounded-lg border-2 transition-all ${documentType === type.value
                                                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                                            }`}
                                    >
                                        <FileText className={`w-6 h-6 mx-auto mb-2 ${documentType === type.value ? 'text-primary-600' : 'text-gray-400'
                                            }`} />
                                        <p className={`text-sm font-medium ${documentType === type.value
                                                ? 'text-primary-700 dark:text-primary-300'
                                                : 'text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {type.label}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* File Upload - Front */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Recto du document *
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0], 'front')}
                                    className="hidden"
                                    id="front-upload"
                                />
                                <label
                                    htmlFor="front-upload"
                                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                                >
                                    {frontPreview ? (
                                        <img src={frontPreview} alt="Preview" className="h-full object-contain" />
                                    ) : (
                                        <>
                                            <Camera className="w-12 h-12 text-gray-400 mb-3" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Cliquez pour télécharger
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                JPG, PNG ou PDF (max 10MB)
                                            </p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* File Upload - Back (optional for ID card) */}
                        {documentType === 'id_card' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Verso du document (optionnel)
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0], 'back')}
                                        className="hidden"
                                        id="back-upload"
                                    />
                                    <label
                                        htmlFor="back-upload"
                                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                                    >
                                        {backPreview ? (
                                            <img src={backPreview} alt="Preview" className="h-full object-contain" />
                                        ) : (
                                            <>
                                                <Camera className="w-12 h-12 text-gray-400 mb-3" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Cliquez pour télécharger
                                                </p>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!frontFile || uploading}
                            className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Traitement en cours...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Soumettre la demande
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Benefits */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary-600" />
                        Avantages du badge vérifié
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Crédibilité accrue</strong> : Gagnez la confiance des recruteurs et partenaires
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Visibilité améliorée</strong> : Profil mis en avant dans les recherches
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Sécurité renforcée</strong> : Protection contre l'usurpation d'identité
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Accès prioritaire</strong> : Fonctionnalités premium exclusives
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default VerifyIdentity;
