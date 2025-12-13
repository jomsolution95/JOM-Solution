import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FeatureFlags, DEFAULT_FEATURE_FLAGS } from '../types/featureFlags';
import { featureFlagsApi } from '../api/featureFlags';
import { FeatureFlagsCache } from '../utils/featureFlagsCache';

interface FeatureFlagsContextType {
    flags: FeatureFlags;
    isLoading: boolean;
    error: Error | null;
    refreshFlags: () => Promise<void>;
    isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
    version: string | null;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [flags, setFlags] = useState<FeatureFlags>(FeatureFlagsCache.getOrDefault());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [version, setVersion] = useState<string | null>(FeatureFlagsCache.getVersion());

    const refreshFlags = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await featureFlagsApi.getAll();

            // Update state
            setFlags(response.flags);
            setVersion(response.version);

            // Save to cache
            FeatureFlagsCache.save(response.flags, response.version);
        } catch (err) {
            console.error('Failed to fetch feature flags:', err);
            setError(err as Error);

            // Fallback to cached or default flags
            const cachedFlags = FeatureFlagsCache.load();
            if (cachedFlags) {
                setFlags(cachedFlags);
            } else {
                setFlags(DEFAULT_FEATURE_FLAGS);
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const isFeatureEnabled = useCallback(
        (feature: keyof FeatureFlags): boolean => {
            return flags[feature] === true;
        },
        [flags]
    );

    // Load flags on mount
    useEffect(() => {
        const cachedFlags = FeatureFlagsCache.load();

        if (cachedFlags && FeatureFlagsCache.isValid()) {
            // Use cached flags
            setFlags(cachedFlags);
            setVersion(FeatureFlagsCache.getVersion());
        } else {
            // Fetch fresh flags
            refreshFlags();
        }
    }, [refreshFlags]);

    // Refresh flags periodically (every hour)
    useEffect(() => {
        const interval = setInterval(() => {
            refreshFlags();
        }, 1000 * 60 * 60); // 1 hour

        return () => clearInterval(interval);
    }, [refreshFlags]);

    const value: FeatureFlagsContextType = {
        flags,
        isLoading,
        error,
        refreshFlags,
        isFeatureEnabled,
        version,
    };

    return (
        <FeatureFlagsContext.Provider value={value}>
            {children}
        </FeatureFlagsContext.Provider>
    );
};

export const useFeatureFlags = (): FeatureFlagsContextType => {
    const context = useContext(FeatureFlagsContext);
    if (!context) {
        throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
    }
    return context;
};
