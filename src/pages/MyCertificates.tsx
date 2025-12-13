import React, { useEffect, useState } from 'react';
import { Download, Award, Calendar, CheckCircle, ExternalLink, QrCode } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';
import { BackButton } from '../components/BackButton';

interface Certificate {
    _id: string;
    certificateNumber: string;
    issuedDate: string;
    verificationCode: string;
    pdfUrl: string;
    courseId: {
        _id: string;
        title: string;
        thumbnail?: string;
    };
    metadata: {
        courseName: string;
        studentName: string;
        completionDate: string;
        grade: string;
    };
}

export const MyCertificates: React.FC = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    useEffect(() => {
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        try {
            const response = await api.get('/certificates/my-certificates');
            setCertificates(response.data.certificates);
        } catch (error) {
            toast.error('Erreur lors du chargement des certificats');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (certificateId: string) => {
        try {
            const response = await api.get(`/certificates/${certificateId}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificate-${certificateId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Certificat téléchargé');
        } catch (error) {
            toast.error('Erreur lors du téléchargement');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Award className="w-12 h-12 text-primary-600 animate-pulse mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Chargement des certificats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton label="Retour" />

                {/* Header */}
                <div className="mt-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Award className="w-8 h-8 text-primary-600" />
                        Mes Certificats
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Tous vos certificats de réussite en un seul endroit
                    </p>
                </div>

                {/* Certificates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((certificate) => (
                        <div
                            key={certificate._id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-primary-200 dark:border-primary-800 overflow-hidden hover:shadow-xl transition-all"
                        >
                            {/* Header with gradient */}
                            <div className="h-32 bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 flex items-center justify-center relative">
                                <Award className="w-16 h-16 text-white opacity-90" />
                                <div className="absolute top-3 right-3">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                                        {certificate.metadata.grade}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                    {certificate.courseId.title}
                                </h3>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(certificate.issuedDate).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Certificat N° {certificate.certificateNumber}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.open(certificate.pdfUrl, '_blank')}
                                        className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Voir
                                    </button>
                                    <button
                                        onClick={() => handleDownload(certificate._id)}
                                        className="flex-1 py-2 border border-primary-600 text-primary-600 dark:text-primary-400 font-medium rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Télécharger
                                    </button>
                                </div>

                                {/* Verification */}
                                <button
                                    onClick={() => {
                                        setSelectedCertificate(certificate);
                                        setShowVerifyModal(true);
                                    }}
                                    className="w-full mt-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center justify-center gap-1"
                                >
                                    <QrCode className="w-4 h-4" />
                                    Code de vérification
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {!loading && certificates.length === 0 && (
                    <div className="text-center py-20">
                        <Award className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Aucun certificat
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Complétez des cours pour obtenir vos certificats
                        </p>
                    </div>
                )}

                {/* Verification Modal */}
                {showVerifyModal && selectedCertificate && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <QrCode className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Code de Vérification
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    Partagez ce code pour vérifier l'authenticité de votre certificat
                                </p>

                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                                    <p className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400 tracking-wider">
                                        {selectedCertificate.verificationCode}
                                    </p>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                                    Vérification disponible sur :{' '}
                                    <span className="font-medium">
                                        jomplatform.com/certificates/verify/{selectedCertificate.verificationCode}
                                    </span>
                                </p>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedCertificate.verificationCode);
                                        toast.success('Code copié !');
                                    }}
                                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors mb-3"
                                >
                                    Copier le code
                                </button>

                                <button
                                    onClick={() => setShowVerifyModal(false)}
                                    className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCertificates;
