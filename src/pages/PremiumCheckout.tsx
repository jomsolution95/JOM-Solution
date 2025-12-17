import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Smartphone, Check, Crown, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';
import { BackButton } from '../components/BackButton';

interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
    popular?: boolean;
}

const PLANS: Record<string, Plan> = {
    'individual-pro': {
        id: 'individual-pro',
        name: 'Jom+ Talent',
        price: 4900,
        features: [
            'Badge "Talent Vérifié"',
            'Remontée en tête de CVthèque',
            'Accès prioritaire aux offres (-24h)',
            'Statistiques de vues de profil',
            'Accès illimité aux formations',
        ],
    },
    'company-biz': {
        id: 'company-biz',
        name: 'Jom Recruteur Pro',
        price: 29900,
        features: [
            'Badge "Entreprise Vérifiée"',
            'ATS Intégré (Suivi candidats)',
            'Accès CVthèque (50 profils/mois)',
            '10 Annonces d\'emploi incluses',
            'Page Entreprise Premium (SEO)',
            'Multi-diffusion automatique',
        ],
        popular: true,
    },
    'school-edu': {
        id: 'school-edu',
        name: 'Jom Academy',
        price: 49900,
        features: [
            'Hébergement de cours illimité',
            'Génération de Certificats JOM',
            'Classes virtuelles intégrées',
            'CRM Étudiants & Suivi',
            'Marketing ciblé vers les étudiants',
        ],
    },
};

type PaymentMethod = 'stripe' | 'wave' | 'orange_money';

export const PremiumCheckout: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Get state from navigation (with defaults)
    const initialPlanId = state?.selectedPlanId;
    const initialBillingCycle = state?.billingCycle || 'monthly';
    const customItem = state?.customItem; // { id, name, price, features, type: 'pack' | 'boost' }

    const [selectedPlan, setSelectedPlan] = useState<string>(initialPlanId || 'company-biz');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialBillingCycle);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);

    // Determine what we are buying
    const isSubscription = !customItem;
    const plan = isSubscription ? PLANS[selectedPlan] : customItem;

    // Calculate price based on Billing Cycle (only for subscriptions)
    const getFinalPrice = () => {
        if (isSubscription && billingCycle === 'yearly') {
            return Math.round(plan.price * 12 * 0.8);
        }
        return plan.price;
    };

    const handleCheckout = async () => {
        if (!user) {
            toast.error('Vous devez être connecté pour souscrire');
            navigate('/login');
            return;
        }

        if ((paymentMethod === 'wave' || paymentMethod === 'orange_money') && !phoneNumber) {
            toast.error('Veuillez entrer votre numéro de téléphone');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/premium/sub/buy', {
                plan: selectedPlan,
                paymentMethod,
                phoneNumber: paymentMethod !== 'stripe' ? phoneNumber : undefined,
                amount: getFinalPrice(),
                currency: 'XOF',
                billingCycle, // Send this to backend
            });

            if (response.data.paymentUrl) {
                // Redirect to payment page (Wave/Orange Money)
                window.location.href = response.data.paymentUrl;
            } else if (response.data.clientSecret) {
                // Handle Stripe payment
                toast.info('Paiement par carte bientôt disponible. Veuillez utiliser Wave ou Orange Money.');
                // TODO: Integrate Stripe Elements
            } else {
                toast.success('Abonnement créé avec succès !');
                navigate('/dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors du paiement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <BackButton label="Retour" />

                {/* Header */}
                <div className="text-center mb-12 mt-6">
                    <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded-full mb-4">
                        <Crown className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                            PAIEMENT SÉCURISÉ
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Finaliser votre abonnement
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Choisissez votre plan et votre méthode de paiement
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Plan Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Plans & Billing (Only for Subscriptions) */}
                        {isSubscription && (
                            <>
                                {/* Billing Toggle */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex justify-center">
                                    <div className="relative inline-flex bg-gray-100 dark:bg-gray-700 rounded-full p-1 cursor-pointer">
                                        <div className="absolute -top-3 -right-3">
                                            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                                                -20%
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setBillingCycle('monthly')}
                                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly'
                                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400'
                                                }`}
                                        >
                                            Mensuel
                                        </button>
                                        <button
                                            onClick={() => setBillingCycle('yearly')}
                                            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'yearly'
                                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400'
                                                }`}
                                        >
                                            Annuel
                                        </button>
                                    </div>
                                </div>

                                {/* Plans List */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        Sélectionnez votre plan
                                    </h2>
                                    <div className="space-y-3">
                                        {Object.values(PLANS).map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => setSelectedPlan(p.id)}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedPlan === p.id
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                                            {p.name}
                                                            {p.popular && (
                                                                <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">
                                                                    POPULAIRE
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                                                            {billingCycle === 'yearly'
                                                                ? (Math.round(p.price * 12 * 0.8)).toLocaleString()
                                                                : p.price.toLocaleString()} FCFA
                                                            <span className="text-sm text-gray-500 font-normal">
                                                                /{billingCycle === 'yearly' ? 'an' : 'mois'}
                                                            </span>
                                                        </p>
                                                        {billingCycle === 'yearly' && (
                                                            <p className="text-xs text-green-600 font-bold">
                                                                Économie : {(p.price * 12 * 0.2).toLocaleString()} FCFA
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === p.id
                                                            ? 'border-primary-500 bg-primary-500'
                                                            : 'border-gray-300'
                                                            }`}
                                                    >
                                                        {selectedPlan === p.id && <Check className="w-4 h-4 text-white" />}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Payment Method */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Méthode de paiement
                            </h2>
                            <div className="space-y-3">
                                {/* Wave */}
                                <button
                                    onClick={() => setPaymentMethod('wave')}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${paymentMethod === 'wave'
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="w-6 h-6 text-blue-600" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white">Wave</h3>
                                            <p className="text-sm text-gray-500">Paiement mobile instantané</p>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'wave'
                                                ? 'border-primary-500 bg-primary-500'
                                                : 'border-gray-300'
                                                }`}
                                        >
                                            {paymentMethod === 'wave' && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                </button>

                                {/* Orange Money */}
                                <button
                                    onClick={() => setPaymentMethod('orange_money')}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${paymentMethod === 'orange_money'
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="w-6 h-6 text-orange-600" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white">Orange Money</h3>
                                            <p className="text-sm text-gray-500">Paiement mobile sécurisé</p>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'orange_money'
                                                ? 'border-primary-500 bg-primary-500'
                                                : 'border-gray-300'
                                                }`}
                                        >
                                            {paymentMethod === 'orange_money' && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                </button>

                                {/* Stripe */}
                                <button
                                    onClick={() => setPaymentMethod('stripe')}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${paymentMethod === 'stripe'
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-6 h-6 text-purple-600" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                Carte Bancaire
                                            </h3>
                                            <p className="text-sm text-gray-500">Visa, Mastercard</p>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'stripe'
                                                ? 'border-primary-500 bg-primary-500'
                                                : 'border-gray-300'
                                                }`}
                                        >
                                            {paymentMethod === 'stripe' && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Phone Number Input */}
                            {(paymentMethod === 'wave' || paymentMethod === 'orange_money') && (
                                <div className="mt-4">
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
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Résumé
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Plan sélectionné</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{plan.name}</p>
                                    <p className="text-xs text-primary-600 font-bold uppercase">
                                        {billingCycle === 'yearly' ? 'Facturation Annuelle' : 'Facturation Mensuelle'}
                                    </p>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                                        Fonctionnalités incluses :
                                    </h3>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {getFinalPrice().toLocaleString()} FCFA
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span className="text-gray-900 dark:text-white">Total</span>
                                        <span className="text-primary-600 dark:text-primary-400">
                                            {getFinalPrice().toLocaleString()} FCFA
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {billingCycle === 'yearly' ? 'Facturé une fois par an' : 'Facturation mensuelle, sans engagement'}
                                    </p>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Traitement...
                                        </>
                                    ) : (
                                        <>
                                            <Crown className="w-5 h-5" />
                                            Souscrire maintenant
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                                    Paiement 100% sécurisé. Vos données sont protégées.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumCheckout;
