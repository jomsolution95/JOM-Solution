export interface FeatureFlags {
    network: boolean;
    ats: boolean;
    marketplace: boolean;
    formations: boolean;
    messaging: boolean;
    premium: boolean;
    analytics: boolean;
    notifications: boolean;
}

export interface FeatureFlagConfig {
    name: keyof FeatureFlags;
    enabled: boolean;
    description: string;
    lastUpdated: string;
}

export interface FeatureFlagsResponse {
    flags: FeatureFlags;
    version: string;
    lastUpdated: string;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
    network: true,
    ats: true,
    marketplace: true,
    formations: true,
    messaging: true,
    premium: true,
    analytics: true,
    notifications: true,
};
