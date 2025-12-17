
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Loader, Calendar, User, BookOpen } from 'lucide-react';
import { certificatesApi } from '../api/certificates';

export const CertificateVerification: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (code) {
            verify(code);
        }
    }, [code]);

    const verify = async (verificationCode: string) => {
        try {
            const data = await certificatesApi.verify(verificationCode);
            setResult(data);
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
        );
    }

    const isValid = result?.valid; // Backend returns { valid: true, certificate: ... }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

                {/* Helper Header */}
                <div className={`p-6 text-center text-white ${isValid ? 'bg-green-600' : 'bg-red-600'}`}>
                    {isValid ? (
                        <div className="flex flex-col items-center">
                            <CheckCircle className="w-16 h-16 mb-2 opacity-90" />
                            <h1 className="text-2xl font-bold">Certificat Valide</h1>
                            <p className="opacity-90">Ce document est authentique</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <XCircle className="w-16 h-16 mb-2 opacity-90" />
                            <h1 className="text-2xl font-bold">Certificat Invalide</h1>
                            <p className="opacity-90">Ce code ne correspond à aucun certificat</p>
                        </div>
                    )}
                </div>

                <div className="p-8">
                    {isValid && result.certificate ? (
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Détenteur</p>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-full">
                                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{result.certificate.studentName}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Formation</p>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-full">
                                        <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{result.certificate.courseName}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date d'émission</p>
                                    <div className="flex items-center gap-1 font-medium dark:text-white">
                                        <Calendar className="w-3 h-3 text-gray-400" />
                                        {new Date(result.certificate.issuedDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Numéro</p>
                                    <div className="flex items-center gap-1 font-mono text-sm dark:text-white font-bold">
                                        {result.certificate.certificateNumber}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center mt-6">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Code de vérification</p>
                                <p className="font-mono font-bold text-lg text-gray-700 dark:text-gray-200 tracking-widest">{code}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-600 dark:text-gray-400">
                            <p>Le code <span className="font-mono font-bold">{code}</span> n'a pas pu être vérifié auprès de nos services.</p>
                            <p className="mt-4 text-sm">Veuillez vérifier que vous avez saisi le code correctement.</p>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                        <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center justify-center gap-2">
                            <Award className="w-4 h-4" /> Vérifié par JOM Platform
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
