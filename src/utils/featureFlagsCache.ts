import { FeatureFlags, DEFAULT_FEATURE_FLAGS } from '../types/featureFlags';

const STORAGE_KEY = 'feature_flags';
const CACHE_EXPIRY_KEY = 'feature_flags_expiry';
const CACHE_VERSION_KEY = 'feature_flags_version';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export class FeatureFlagsCache {
    // Save flags to local storage
    static save(flags: FeatureFlags, version: string): void {
        try {
            const expiry = Date.now() + CACHE_DURATION;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
            localStorage.setItem(CACHE_EXPIRY_KEY, expiry.toString());
            localStorage.setItem(CACHE_VERSION_KEY, version);
        } catch (error) {
            console.error('Failed to save feature flags to cache:', error);
        }
    }

    // Load flags from local storage
    static load(): FeatureFlags | null {
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

            if (!cached || !expiry) {
                return null;
            }

            // Check if cache is expired
            if (Date.now() > parseInt(expiry)) {
                this.clear();
                return null;
            }

            return JSON.parse(cached) as FeatureFlags;
        } catch (error) {
            console.error('Failed to load feature flags from cache:', error);
            return null;
        }
    }

    // Get cached version
    static getVersion(): string | null {
        return localStorage.getItem(CACHE_VERSION_KEY);
    }

    // Check if cache is valid
    static isValid(): boolean {
        const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        if (!expiry) return false;
        return Date.now() <= parseInt(expiry);
    }

    // Clear cache
    static clear(): void {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CACHE_EXPIRY_KEY);
        localStorage.removeItem(CACHE_VERSION_KEY);
    }

    // Get flags with fallback to defaults
    static getOrDefault(): FeatureFlags {
        const cached = this.load();
        return cached || DEFAULT_FEATURE_FLAGS;
    }
}
