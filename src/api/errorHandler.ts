import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

interface ApiErrorResponse {
    message?: string;
    error?: string;
    statusCode?: number;
}

/**
 * Unified error handler for API requests
 * Shows user-friendly toast notifications and logs detailed errors to console
 */
export const handleApiError = (error: AxiosError<ApiErrorResponse>) => {
    // Network error (no response from server)
    if (!error.response) {
        console.error('Network Error:', error.message);
        toast.error('Network error. Please check your connection and try again.');
        return;
    }

    const { status, data } = error.response;
    const errorMessage = data?.message || data?.error || 'An unexpected error occurred';

    // Log detailed error to console for debugging
    console.error('API Error:', {
        status,
        url: error.config?.url,
        method: error.config?.method,
        message: errorMessage,
        data: data,
    });

    // Handle specific status codes
    switch (status) {
        case 400:
            toast.error(`Bad Request: ${errorMessage}`);
            break;

        case 401:
            // Don't show toast for 401 - handled by interceptor
            console.warn('Unauthorized - Token refresh will be attempted');
            break;

        case 403:
            toast.error('Access forbidden. You do not have permission to perform this action.');
            break;

        case 404:
            toast.error('Resource not found.');
            break;

        case 409:
            toast.error(`Conflict: ${errorMessage}`);
            break;

        case 422:
            toast.error(`Validation Error: ${errorMessage}`);
            break;

        case 429:
            toast.error('Too many requests. Please slow down and try again later.');
            break;

        case 500:
            toast.error('Server error. Please try again later.');
            break;

        case 503:
            toast.error('Service temporarily unavailable. Please try again later.');
            break;

        default:
            toast.error(errorMessage);
    }
};

/**
 * Handle success messages
 */
export const handleApiSuccess = (message: string) => {
    toast.success(message);
};

/**
 * Extract error message from error object
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        return error.response?.data?.message || error.message || 'An error occurred';
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
};
