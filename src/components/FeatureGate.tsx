import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import { FeatureFlags } from '../types/featureFlags';

interface FeatureGateProps {
    feature: keyof FeatureFlags;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
    feature,
    children,
    fallback,
    redirectTo,
}) => {
    const { isFeatureEnabled, isLoading } = useFeatureFlags();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isFeatureEnabled(feature)) {
        if (redirectTo) {
            return <Navigate to={redirectTo} replace />;
        }

        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center max-w-md px-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Feature Not Available
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        This feature is currently not available. Please check back later.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
