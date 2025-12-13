import React, { useEffect, useState } from 'react';
import { Package, CreditCard, TrendingUp, Check, Zap, Smartphone, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';
import { BackButton } from '../components/BackButton';

interface PackPricing {
    size: number;
    credits: number;
    price: number;
    pricePerJob: number;
    savings: number;
}

interface Pack {
    _id: string;
    packSize: number;
    totalCredits: number;
    usedCredits: number;
    remainingCredits: number;
    price: number;
    purchaseDate: string;
    expiryDate: string;
    status: string;
    transactionId?: string;
    paymentMethod?: string;
}

export const RecruitmentPacks: React.FC = () => {
    const [pricing, setPricing] = useState<PackPricing[]>([]);
    const [packs, setPacks] = useState<Pack[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);

    // Payment Modal State
    const [selectedPack, setSelectedPack] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pricingRes, packsRes, statsRes] = await Promise.all([
                api.get('/recruitment-packs/pricing'),
                api.get('/recruitment-packs'),
                api.get('/recruitment-packs/stats'),
            ]);

            setPricing(pricingRes.data.pricing);
            setPacks(packsRes.data.packs);
            setStats(statsRes.data.stats);
        } catch (error) {
            toast.error('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const openPaymentModal = (packSize: number) => {
        setSelectedPack(packSize);
        setShowModal(true);
    };

    const handlePurchase = async () => {
        if (!selectedPack) return;

        setPurchasing(true);
        try {
            const payload: any = {
                packSize: selectedPack,
                paymentMethod: 'paytech', // Default to PayTech
            };

            const response = await api.post('/recruitment-packs/purchase', payload);

            if (response.data.paymentUrl) {
                // Redirect to payment gateway (PayTech)
                window.location.href = response.data.paymentUrl;
                return;
            }

            toast.success('Validation en cours...');
            setShowModal(false);
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'achat');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Package className="w-12 h-12 text-primary-600 animate-pulse" />
            </div>
        );
    }

    const currentPackPrice = pricing.find(p => p.size === selectedPack)?.price || 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton label="Retour" />

                {/* Header */}
                <div className="mt-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Package className="w-8 h-8 text-primary-600" />
                        Packs de Recrutement
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Achetez des crédits d'annonces en pack et économisez
                    </p>
                </div>

                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalRemaining}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Crédits restants</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalUsed}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Crédits utilisés</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.activePacks}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Packs actifs</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalSpent?.toLocaleString()} F
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total dépensé</p>
                        </div>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Choisissez votre pack
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pricing.map((pack, idx) => (
                            <div
                                key={pack.size}
                                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 overflow-hidden transition-all hover:shadow-xl ${idx === 1
                                    ? 'border-primary-500 scale-105'
                                    : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                {idx === 1 && (
                                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-center py-2 text-sm font-bold">
                                        ⭐ POPULAIRE
                                    </div>
                                )}

                                <div className="p-8">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Package className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Pack {pack.credits}
                                        </h3>
                                        <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                                            {pack.price.toLocaleString()} F
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {pack.pricePerJob.toLocaleString()} F / annonce
                                        </p>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span>{pack.credits} annonces incluses</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span>Valable 1 an</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span>Support prioritaire</span>
                                        </div>
                                        {pack.savings > 0 && (
                                            <div className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400">
                                                <Zap className="w-5 h-5 flex-shrink-0" />
                                                <span>Économisez {pack.savings}%</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => openPaymentModal(pack.size)}
                                        disabled={purchasing}
                                        className={`w-full py-3 rounded-lg font-bold transition-all ${idx === 1
                                            ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                                            } disabled:opacity-50`}
                                    >
                                        Acheter maintenant
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* My Packs */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Mes packs
                    </h2>
                    <div className="space-y-4">
                        {packs.map((pack) => (
                            <div
                                key={pack._id}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                            <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                Pack {pack.totalCredits} annonces
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Acheté le {new Date(pack.purchaseDate).toLocaleDateString('fr-FR')}
                                                {pack.paymentMethod === 'manual' && pack.status === 'pending' && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        En attente de validation
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                            {pack.remainingCredits}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            / {pack.totalCredits} restants
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${(pack.usedCredits / pack.totalCredits) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span>{pack.usedCredits} utilisés</span>
                                        <span>
                                            Expire le {new Date(pack.expiryDate).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {packs.length === 0 && (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    Aucun pack acheté pour le moment
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Récapitulatif
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600 dark:text-gray-400">Pack sélectionné</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {pricing.find(p => p.size === selectedPack)?.credits} Annonces
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600 dark:text-gray-400">Total à payer</span>
                                        <span className="font-bold text-xl text-primary-600 dark:text-primary-400">
                                            {currentPackPrice.toLocaleString()} FCFA
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={purchasing}
                                className="w-full py-3 bg-[#0d4f91] hover:bg-[#083a6e] text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {purchasing ? (
                                    'Démarrage du paiement...'
                                ) : (
                                    <>
                                        <span>Procéder au Paiement</span>
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                Paiement sécurisé via PayTech (Carte Bancaire, Orange Money, Wave...)
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruitmentPacks;
