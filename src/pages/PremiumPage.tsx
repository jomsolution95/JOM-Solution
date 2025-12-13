import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Crown, CheckCircle, Clock, Lock, TrendingUp, Zap,
    Users, FileText, Award, Shield, Briefcase, BarChart3,
    MessageCircle, Star, Package, Radio, Eye, BookOpen,
    CreditCard, ArrowRight, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';
import { BackButton } from '../components/BackButton';

interface PremiumFeature {
    id: string;
    name: string;
    description: string;
    icon: any;
    status: 'implemented' | 'in_progress' | 'locked';
    plans: string[];
    quota?: {
        used: number;
        total: number;
        unlimited?: boolean;
    };
    route?: string;
}

interface UserSubscription {
    plan: string;
    active: boolean;
    quotas: any;
}

const FEATURE_ICONS: { [key: string]: any } = {
    boost: Zap,
    cvtheque: Users,
    stats: BarChart3,
    certificates: Award,
    courses: BookOpen,
    broadcast: Radio,
    packs: Package,
    verification: Shield,
    applications: Briefcase,
    ads: MessageCircle,
};

export const PremiumPage: React.FC = () => {
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [features, setFeatures] = useState<PremiumFeature[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPremiumData();
    }, []);

    const loadPremiumData = async () => {
        try {
            const [subResponse, quotasResponse] = await Promise.all([
                api.get('/premium/subscription'),
                api.get('/premium/quotas'),
            ]);

            setSubscription(subResponse.data.subscription);

            // Build features list dynamically
            const featuresList = buildFeaturesList(
                subResponse.data.subscription,
                quotasResponse.data.quotas
            );
            setFeatures(featuresList);
        } catch (error) {
            console.error('Error loading premium data:', error);
        } finally {
            setLoading(false);
        }
    };

    const buildFeaturesList = (sub: any, quotas: any): PremiumFeature[] => {
        const userPlan = sub?.plan || 'free';

        return [
            // Boosts
            {
                id: 'boost_profile',
                name: 'Profile Star',
                description: 'Mettez en avant votre profil pendant 7 jours',
                icon: Star,
                status: 'implemented',
                plans: ['INDIVIDUAL_PREMIUM', 'INDIVIDUAL_PLUS'],
                quota: quotas?.PROFILE_BOOST,
                route: '/boosts',
            },
            {
                id: 'boost_job',
                name: 'Featured Job',
                description: 'Annonce en tête de liste pendant 7 jours',
                icon: Briefcase,
                status: 'implemented',
                plans: ['COMPANY_STANDARD', 'COMPANY_BIZ'],
                quota: quotas?.JOB_BOOST,
                route: '/boosts',
            },

            // CVthèque
            {
                id: 'cvtheque',
                name: 'CVthèque Premium',
                description: 'Accès à la base de données de CV',
                icon: Users,
                status: 'implemented',
                plans: ['COMPANY_BIZ'],
                quota: quotas?.CV_VIEWS,
                route: '/cvtheque',
            },

            // Statistiques
            {
                id: 'stats_profile',
                name: 'Statistiques Profil',
                description: 'Analytics détaillées de votre profil',
                icon: BarChart3,
                status: 'implemented',
                plans: ['INDIVIDUAL_PREMIUM', 'INDIVIDUAL_PLUS'],
                route: '/premium-stats',
            },
            {
                id: 'stats_recruitment',
                name: 'Dashboard Recrutement',
                description: 'Métriques de vos campagnes de recrutement',
                icon: TrendingUp,
                status: 'implemented',
                plans: ['COMPANY_STANDARD', 'COMPANY_BIZ'],
                route: '/recruitment-dashboard',
            },
            {
                id: 'stats_academy',
                name: 'Dashboard Academy',
                description: 'Suivi des étudiants et formations',
                icon: BookOpen,
                status: 'implemented',
                plans: ['SCHOOL_EDU'],
                route: '/academy-dashboard',
            },

            // Formations
            {
                id: 'courses_unlimited',
                name: 'Formations Illimitées',
                description: 'Créez autant de cours que vous voulez',
                icon: BookOpen,
                status: 'implemented',
                plans: ['SCHOOL_EDU'],
                quota: { used: 0, total: 0, unlimited: true },
                route: '/academy/admin',
            },

            // Certificats
            {
                id: 'certificates',
                name: 'Certificats Automatiques',
                description: 'Génération PDF avec QR code',
                icon: Award,
                status: 'implemented',
                plans: ['SCHOOL_EDU'],
                route: '/my-certificates',
            },

            // Diffusion automatique
            {
                id: 'auto_broadcast',
                name: 'Multi-diffusion Auto',
                description: 'Diffusez vos offres sur tous les canaux',
                icon: Radio,
                status: 'implemented',
                plans: ['COMPANY_STANDARD', 'COMPANY_BIZ'],
                route: '/jobs/create',
            },

            // Packs de recrutement
            {
                id: 'recruitment_packs',
                name: 'Packs Recrutement',
                description: 'Achetez des crédits d\'annonces en pack',
                icon: Package,
                status: 'implemented',
                plans: ['COMPANY_STANDARD', 'COMPANY_BIZ'],
                route: '/recruitment-packs',
            },

            // Tracking candidatures
            {
                id: 'application_tracking',
                name: 'Suivi Candidatures',
                description: 'Timeline et relances automatiques',
                icon: Briefcase,
                status: 'implemented',
                plans: ['INDIVIDUAL_PREMIUM', 'INDIVIDUAL_PLUS'],
                route: '/my-applications',
            },

            // Vérification identité
            {
                id: 'identity_verification',
                name: 'Badge Vérifié',
                description: 'Vérification d\'identité avec OCR',
                icon: Shield,
                status: 'implemented',
                plans: ['INDIVIDUAL_PREMIUM', 'INDIVIDUAL_PLUS', 'COMPANY_STANDARD', 'COMPANY_BIZ'],
                route: '/verify-identity',
            },

            // Régie publicitaire
            {
                id: 'ads_manager',
                name: 'Ads Manager',
                description: 'Créez des campagnes publicitaires',
                icon: MessageCircle,
                status: 'implemented',
                plans: ['COMPANY_BIZ'],
                route: '/ads/campaigns',
            },
        ];
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'implemented':
                return {
                    icon: CheckCircle,
                    label: 'Disponible',
                    color: 'green',
                    bgColor: 'bg-green-100 dark:bg-green-900/30',
                    textColor: 'text-green-700 dark:text-green-300',
                };
            case 'in_progress':
                return {
                    icon: Clock,
                    label: 'Bientôt',
                    color: 'yellow',
                    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                    textColor: 'text-yellow-700 dark:text-yellow-300',
                };
            case 'locked':
                return {
                    icon: Lock,
                    label: 'Verrouillé',
                    color: 'gray',
                    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
                    textColor: 'text-gray-700 dark:text-gray-300',
                };
            default:
                return {
                    icon: Lock,
                    label: 'Inconnu',
                    color: 'gray',
                    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
                    textColor: 'text-gray-700 dark:text-gray-300',
                };
        }
    };

    const isFeatureAvailable = (feature: PremiumFeature): boolean => {
        if (!subscription?.active) return false;
        return feature.plans.includes(subscription.plan);
    };

    const handleUpgrade = (feature: PremiumFeature) => {
        navigate('/premium/checkout');
    };

    const handleFeatureClick = (feature: PremiumFeature) => {
        if (feature.status !== 'implemented') {
            toast.info('Cette fonctionnalité sera bientôt disponible');
            return;
        }

        if (!isFeatureAvailable(feature)) {
            toast.error('Passez à Premium pour accéder à cette fonctionnalité');
            return;
        }

        if (feature.route) {
            navigate(feature.route);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Crown className="w-12 h-12 text-primary-600 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton label="Retour" />

                {/* Header */}
                <div className="mt-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Crown className="w-8 h-8 text-primary-600" />
                                Fonctionnalités Premium
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Découvrez toutes les fonctionnalités disponibles
                            </p>
                        </div>

                        {subscription?.active && (
                            <div className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl">
                                <div className="text-sm opacity-90">Votre plan</div>
                                <div className="text-lg font-bold">{subscription.plan}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Plan Banner */}
                {!subscription?.active && (
                    <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <Sparkles className="w-8 h-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    Passez à Premium pour débloquer toutes les fonctionnalités
                                </h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                                    Accédez à des outils puissants pour booster votre carrière ou votre entreprise
                                </p>
                                <button
                                    onClick={() => navigate('/premium/checkout')}
                                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <Crown className="w-5 h-5" />
                                    Découvrir les plans
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        const statusBadge = getStatusBadge(feature.status);
                        const StatusIcon = statusBadge.icon;
                        const isAvailable = isFeatureAvailable(feature);

                        return (
                            <div
                                key={feature.id}
                                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 overflow-hidden transition-all ${isAvailable && feature.status === 'implemented'
                                        ? 'border-primary-200 dark:border-primary-800 hover:shadow-xl cursor-pointer'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                onClick={() => isAvailable && handleFeatureClick(feature)}
                            >
                                {/* Header */}
                                <div className={`p-4 ${isAvailable ? 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isAvailable ? 'bg-gradient-to-br from-primary-500 to-secondary-500' : 'bg-gray-300 dark:bg-gray-600'
                                            }`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>

                                        <div className={`px-3 py-1 rounded-full ${statusBadge.bgColor} flex items-center gap-1`}>
                                            <StatusIcon className={`w-3 h-3 ${statusBadge.textColor}`} />
                                            <span className={`text-xs font-medium ${statusBadge.textColor}`}>
                                                {statusBadge.label}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {feature.name}
                                    </h3>
                                </div>

                                {/* Body */}
                                <div className="p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {feature.description}
                                    </p>

                                    {/* Quota Display */}
                                    {feature.quota && isAvailable && (
                                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                                    {feature.quota.unlimited ? 'Illimité' : 'Quota'}
                                                </span>
                                                {!feature.quota.unlimited && (
                                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                                        {feature.quota.used} / {feature.quota.total}
                                                    </span>
                                                )}
                                            </div>
                                            {!feature.quota.unlimited && (
                                                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all"
                                                        style={{
                                                            width: `${Math.min((feature.quota.used / feature.quota.total) * 100, 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {isAvailable ? (
                                        feature.status === 'implemented' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFeatureClick(feature);
                                                }}
                                                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                Accéder
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpgrade(feature);
                                            }}
                                            className="w-full py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            <Crown className="w-4 h-4" />
                                            Upgrade
                                        </button>
                                    )}

                                    {/* Plans Badge */}
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {feature.plans.map((plan) => (
                                            <span
                                                key={plan}
                                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded"
                                            >
                                                {plan.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA Section */}
                {!subscription?.active && (
                    <div className="mt-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white text-center">
                        <Crown className="w-16 h-16 mx-auto mb-4 opacity-90" />
                        <h2 className="text-3xl font-bold mb-4">
                            Prêt à passer à la vitesse supérieure ?
                        </h2>
                        <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                            Choisissez le plan qui correspond à vos besoins et débloquez toutes les fonctionnalités premium
                        </p>
                        <button
                            onClick={() => navigate('/premium/checkout')}
                            className="px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:shadow-2xl transition-all inline-flex items-center gap-3"
                        >
                            Voir les plans
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PremiumPage;
