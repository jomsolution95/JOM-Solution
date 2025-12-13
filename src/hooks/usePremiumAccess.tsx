import { useState, useEffect } from 'react';
import api from '../api/client';

export type AccessStatus = 'allowed' | 'forbidden' | 'upgradeRequired' | 'loading';

interface PremiumAccessResult {
    status: AccessStatus;
    subscription: any;
    quota?: {
        used: number;
        total: number;
        remaining: number;
        unlimited?: boolean;
    };
    requiredPlans: string[];
    currentPlan?: string;
    isLoading: boolean;
}

// Feature configuration
const FEATURE_CONFIG: {
    [key: string]: {
        requiredPlans: string[];
        quotaType?: string;
    };
} = {
    // Boosts
    boost_profile: {
        requiredPlans: ['INDIVIDUAL_PREMIUM', 'INDIVIDUAL_PLUS'],
        quotaType: 'PROFILE_BOOST',
    },
    boost_job: {
        requiredPlans: ['COMPANY_STANDARD', 'COMPANY_BIZ'],
        quotaType: 'JOB_BOOST',
    },

    // CVthèque
    cvtheque: {
        requiredPlans: ['COMPANY_BIZ'],
        quotaType: 'CV_VIEWS',
    },

    // Statistics
    stats_profile: {
        requiredPlans: ['INDIVIDUAL_PREMIUM', 'INDIVIDUAL_PLUS'],
    },
    stats_recruitment: {
        requiredPlans: ['COMPANY_STANDARD', 'COMPANY_BIZ'],
    },
    stats_academy: {
        requiredPlans: ['SCHOOL_EDU'],
    },

    // Academy
    courses: {
        requiredPlans: ['SCHOOL_EDU'],
    },
    certificates: {
        requiredPlans: ['SCHOOL_EDU'],
    },

    // Broadcasting
    auto_broadcast: {
        requiredPlans: ['COMPANY_STANDARD', 'COMPANY_BIZ'],
    },

    // Recruitment
    recruitment_packs: {
        requiredPlans: ['COMPANY_STANDARD', 'COMPANY_BIZ'],
    },

    // Applications
    application_tracking: {
        requiredPlans: ['INDIVIDUAL_PREMIUM', 'INDIVIDUAL_PLUS'],
    },
    application_followup: {
        requiredPlans: ['INDIVIDUAL_PREMIUM', 'INDIVIDUAL_PLUS'],
        quotaType: 'APPLICATION_FOLLOWUP',
    },

    // Verification
    identity_verification: {
        requiredPlans: ['INDIVIDUAL_PREMIUM', 'INDIVIDUAL_PLUS', 'COMPANY_STANDARD', 'COMPANY_BIZ'],
    },

    // Ads
    ads_manager: {
        requiredPlans: ['COMPANY_BIZ'],
    },

    // Templates
    premium_templates: {
        requiredPlans: ['INDIVIDUAL_PREMIUM', 'INDIVIDUAL_PLUS'],
    },
};

/**
 * Hook to check premium access for a specific feature
 */
export const usePremiumAccess = (featureId: string): PremiumAccessResult => {
    const [status, setStatus] = useState<AccessStatus>('loading');
    const [subscription, setSubscription] = useState<any>(null);
    const [quota, setQuota] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAccess();
    }, [featureId]);

    const checkAccess = async () => {
        try {
            setIsLoading(true);

            // Get feature config
            const featureConfig = FEATURE_CONFIG[featureId];
            if (!featureConfig) {
                console.warn(`Feature ${featureId} not found in config`);
                setStatus('forbidden');
                setIsLoading(false);
                return;
            }

            // Get user subscription
            const subResponse = await api.get('/premium/subscription');
            const userSubscription = subResponse.data.subscription;
            setSubscription(userSubscription);

            // Check if user has active subscription
            if (!userSubscription || !userSubscription.active) {
                setStatus('upgradeRequired');
                setIsLoading(false);
                return;
            }

            // Check if user's plan is in required plans
            const hasRequiredPlan = featureConfig.requiredPlans.includes(
                userSubscription.plan
            );

            if (!hasRequiredPlan) {
                setStatus('upgradeRequired');
                setIsLoading(false);
                return;
            }

            // Check quota if feature has quota type
            if (featureConfig.quotaType) {
                const quotaResponse = await api.get('/premium/quotas');
                const quotaData = quotaResponse.data.quotas[featureConfig.quotaType];

                if (quotaData) {
                    setQuota({
                        used: quotaData.used || 0,
                        total: quotaData.total || 0,
                        remaining: quotaData.remaining || 0,
                        unlimited: quotaData.unlimited || false,
                    });

                    // Check if quota is available
                    if (!quotaData.unlimited && quotaData.remaining <= 0) {
                        setStatus('forbidden');
                        setIsLoading(false);
                        return;
                    }
                }
            }

            // All checks passed
            setStatus('allowed');
        } catch (error) {
            console.error('Error checking premium access:', error);
            setStatus('forbidden');
        } finally {
            setIsLoading(false);
        }
    };

    const featureConfig = FEATURE_CONFIG[featureId] || { requiredPlans: [] };

    return {
        status,
        subscription,
        quota,
        requiredPlans: featureConfig.requiredPlans,
        currentPlan: subscription?.plan,
        isLoading,
    };
};

/**
 * Component to wrap premium features with access control
 */
export const PremiumFeatureGuard: React.FC<{
    featureId: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onUpgradeRequired?: () => void;
}> = ({ featureId, children, fallback, onUpgradeRequired }) => {
    const { status, isLoading, requiredPlans } = usePremiumAccess(featureId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (status === 'upgradeRequired') {
        if (onUpgradeRequired) {
            onUpgradeRequired();
        }

        return (
            fallback || (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Fonctionnalité Premium
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Cette fonctionnalité nécessite un abonnement Premium.
                        </p>
                        <div className="mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Plans requis :
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {requiredPlans.map((plan) => (
                                    <span
                                        key={plan}
                                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                                    >
                                        {plan.replace('_', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => (window.location.href = '/premium/checkout')}
                            className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                        >
                            Passer à Premium
                        </button>
                    </div>
                </div>
            )
        );
    }

    if (status === 'forbidden') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Accès Refusé
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Vous n'avez pas accès à cette fonctionnalité.
                    </p>
                    <button
                        onClick={() => (window.location.href = '/premium')}
                        className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default usePremiumAccess;
