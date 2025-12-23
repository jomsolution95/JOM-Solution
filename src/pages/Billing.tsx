
import React, { useState, useEffect } from 'react';
import { Download, History, Crown, CreditCard, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';
import api from '../api/client';

interface Subscription {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    price?: number;
}

export const Billing: React.FC = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const { data } = await api.get('/premium/subscription');
                if (data && data.subscription) {
                    setSubscription(data.subscription);
                }
            } catch (error) {
                console.error("Failed to fetch subscription", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscription();
    }, []);

    const getPlanName = (plan: string) => {
        switch (plan) {
            case 'plus_talent': return 'Jom+ Talent';
            case 'recruiter_pro': return 'Jom Recruteur Pro';
            case 'academy_access': return 'Jom Academy';
            default: return plan;
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <BackButton />
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facturation & Abonnement</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez votre abonnement et vos factures.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">

                        {/* Current Plan Info */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Crown className="w-6 h-6 text-yellow-400" />
                                        <h2 className="text-lg font-bold text-yellow-400 uppercase tracking-wider">Statut Actuel</h2>
                                    </div>
                                    <p className="text-3xl font-bold mb-1">
                                        {subscription ? getPlanName(subscription.plan) : 'Membre Gratuit'}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        {subscription
                                            ? `Expire le ${new Date(subscription.endDate).toLocaleDateString()}`
                                            : 'Passez à la vitesse supérieure avec nos offres Premium.'}
                                    </p>
                                    {subscription && (
                                        <div className="mt-4 flex gap-4 text-sm text-gray-300">
                                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Début: {new Date(subscription.startDate).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> {subscription.autoRenew ? 'Renouvellement auto' : 'Pas de renouvellement'}</span>
                                        </div>
                                    )}
                                </div>
                                {!subscription && (
                                    <button className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition-colors shadow-lg">
                                        Voir les offres Premium
                                    </button>
                                )}
                                {subscription && (
                                    <button className="border border-white/20 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-colors">
                                        Gérer l'abonnement
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Invoices History (Placeholder for now as API lacks full history) */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <History className="w-5 h-5 text-gray-400" /> Historique des paiements
                                </h3>
                            </div>

                            {subscription ? (
                                <div className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-500">
                                            <Crown className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Abonnement {getPlanName(subscription.plan)}</p>
                                            <p className="text-xs text-gray-500">{new Date(subscription.startDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        {/* Price might not be in subscription object directly depending on schema, assume generic or hide */}
                                        <span className="font-bold text-gray-900 dark:text-white">Actif</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                    Aucun historique de paiement pour le moment.
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 text-center">
                            <p>
                                <strong>Note :</strong> Seuls les paiements relatifs aux abonnements JOM Premium actifs apparaissent ici pour l'instant.
                            </p>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Billing;

