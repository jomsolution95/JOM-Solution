import React, { useState } from 'react';
import { Zap, X, Check, Loader2, Star, Bell, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';

interface BoostOption {
    type: string;
    title: string;
    description: string;
    price: number;
    duration: string;
    icon: React.ElementType;
    color: string;
}

interface BoostPopupProps {
    targetId: string;
    targetType: 'profile' | 'job' | 'training';
    onClose: () => void;
    onSuccess?: () => void;
}

const BOOST_OPTIONS: Record<string, BoostOption[]> = {
    profile: [
        {
            type: 'profile_star',
            title: 'Profil Star',
            description: 'Apparaissez en tête des recherches de talents',
            price: 2000,
            duration: '7 jours',
            icon: Star,
            color: 'from-yellow-500 to-orange-500',
        },
        {
            type: 'profile_urgent',
            title: 'Badge Urgent',
            description: 'Signalez que vous êtes disponible immédiatement',
            price: 1000,
            duration: '14 jours',
            icon: Zap,
            color: 'from-red-500 to-pink-500',
        },
    ],
    job: [
        {
            type: 'job_featured',
            title: 'Annonce à la Une',
            description: 'Votre offre épinglée en haut des résultats',
            price: 5000,
            duration: '7 jours',
            icon: TrendingUp,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            type: 'job_urgent',
            title: 'Badge Urgent',
            description: 'Attirez l\'attention sur un recrutement critique',
            price: 2000,
            duration: '14 jours',
            icon: Zap,
            color: 'from-red-500 to-pink-500',
        },
        {
            type: 'job_push_notification',
            title: 'Push Notification',
            description: 'Alerte envoyée aux profils correspondants',
            price: 15000,
            duration: '1 envoi',
            icon: Bell,
            color: 'from-purple-500 to-indigo-500',
        },
    ],
    training: [
        {
            type: 'training_featured',
            title: 'Formation à la Une',
            description: 'Mettez en avant un programme spécifique',
            price: 10000,
            duration: '15 jours',
            icon: Star,
            color: 'from-green-500 to-emerald-500',
        },
    ],
};

export const BoostPopup: React.FC<BoostPopupProps> = ({
    targetId,
    targetType,
    onClose,
    onSuccess,
}) => {
    const [selectedBoost, setSelectedBoost] = useState<BoostOption | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money' | 'stripe'>('wave');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const boostOptions = BOOST_OPTIONS[targetType] || [];

    const handleBoost = async () => {
        if (!selectedBoost) {
            toast.error('Veuillez sélectionner un boost');
            return;
        }

        if ((paymentMethod === 'wave' || paymentMethod === 'orange_money') && !phoneNumber) {
            toast.error('Veuillez entrer votre numéro de téléphone');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/boosts', {
                type: selectedBoost.type,
                targetId,
                targetType,
                price: selectedBoost.price,
                currency: 'XOF',
                paymentMethod,
                phoneNumber: paymentMethod !== 'stripe' ? phoneNumber : undefined,
            });

            if (response.data.paymentUrl) {
                // Redirect to payment page
                window.location.href = response.data.paymentUrl;
            } else {
                toast.success('Boost activé avec succès !');
                onSuccess?.();
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'activation du boost');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Zap className="w-6 h-6 text-primary-600" />
                            Booster votre visibilité
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Augmentez vos chances de succès
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Boost Options */}
                <div className="p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Choisissez votre boost
                    </h3>
                    {boostOptions.map((option) => (
                        <button
                            key={option.type}
                            onClick={() => setSelectedBoost(option)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedBoost?.type === option.type
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0`}
                                >
                                    <option.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                        {option.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {option.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="font-bold text-primary-600 dark:text-primary-400">
                                            {option.price.toLocaleString()} FCFA
                                        </span>
                                        <span className="text-gray-500">•</span>
                                        <span className="text-gray-500">{option.duration}</span>
                                    </div>
                                </div>
                                <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedBoost?.type === option.type
                                            ? 'border-primary-500 bg-primary-500'
                                            : 'border-gray-300'
                                        }`}
                                >
                                    {selectedBoost?.type === option.type && (
                                        <Check className="w-4 h-4 text-white" />
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Payment Method */}
                {selectedBoost && (
                    <div className="px-6 pb-6 space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Méthode de paiement
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setPaymentMethod('wave')}
                                className={`p-3 rounded-lg border-2 transition-all ${paymentMethod === 'wave'
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Wave</p>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('orange_money')}
                                className={`p-3 rounded-lg border-2 transition-all ${paymentMethod === 'orange_money'
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Orange Money</p>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('stripe')}
                                className={`p-3 rounded-lg border-2 transition-all ${paymentMethod === 'stripe'
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Carte</p>
                            </button>
                        </div>

                        {(paymentMethod === 'wave' || paymentMethod === 'orange_money') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Numéro de téléphone
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+221 XX XXX XX XX"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <div>
                        {selectedBoost && (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total à payer</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedBoost.price.toLocaleString()} FCFA
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleBoost}
                            disabled={!selectedBoost || loading}
                            className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Traitement...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Activer le boost
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoostPopup;
