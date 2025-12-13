import apiClient from './client';
import { FeatureFlags, FeatureFlagsResponse } from '../types/featureFlags';

const FEATURE_FLAGS_ENDPOINT = '/feature-flags';

export const featureFlagsApi = {
    // Get all feature flags
    getAll: async (): Promise<FeatureFlagsResponse> => {
        const response = await apiClient.get<FeatureFlagsResponse>(FEATURE_FLAGS_ENDPOINT);
        return response.data;
    },

    // Get feature flags for specific user
    getForUser: async (userId: string): Promise<FeatureFlagsResponse> => {
        const response = await apiClient.get<FeatureFlagsResponse>(
            `${FEATURE_FLAGS_ENDPOINT}/user/${userId}`
        );
        return response.data;
    },

    // Update feature flag (admin only)
    update: async (flagName: keyof FeatureFlags, enabled: boolean): Promise<void> => {
        await apiClient.put(`${FEATURE_FLAGS_ENDPOINT}/${flagName}`, { enabled });
    },

    // Bulk update feature flags (admin only)
    bulkUpdate: async (flags: Partial<FeatureFlags>): Promise<void> => {
        await apiClient.put(FEATURE_FLAGS_ENDPOINT, { flags });
    },
};
