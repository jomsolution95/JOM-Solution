// Export the configured axios instance as default
export { default } from './client';

// Export auth helpers
export {
    login,
    logout,
    refreshAccessToken,
    isAuthenticated,
    getCurrentUser,
} from './auth';

// Export error handlers
export {
    handleApiError,
    handleApiSuccess,
    getErrorMessage,
} from './errorHandler';

// Re-export axios instance as named export for convenience
export { default as apiClient } from './client';
