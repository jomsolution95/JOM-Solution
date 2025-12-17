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
        toast.error('Erreur réseau. Vérifiez votre connexion et réessayez.');
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
            toast.error(`Requête invalide : ${errorMessage}`);
            break;

        case 401:
            // Don't show toast for 401 - handled by interceptor (auth flow)
            console.warn('Unauthorized - Token refresh will be attempted');
            break;

        case 403:
            toast.error('Accès refusé. Vous n\'avez pas la permission d\'effectuer cette action.');
            break;

        case 404:
            toast.error('Ressource introuvable.');
            break;

        case 409:
            // Specific handling for duplicate users is often 409
            toast.error(`Conflit : ${errorMessage}`);
            break;

        case 422:
            toast.error(`Erreur de validation : ${errorMessage}`);
            break;

        case 429:
            toast.error('Trop de requêtes. Veuillez ralentir et réessayer plus tard.');
            break;

        case 500:
            toast.error('Erreur serveur. Veuillez réessayer plus tard.');
            break;

        case 503:
            toast.error('Service temporairement indisponible. Veuillez réessayer plus tard.');
            break;

        default:
            toast.error(errorMessage || 'Une erreur inattendue est survenue.');
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
