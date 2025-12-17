import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { handleApiError } from './errorHandler';
import { refreshAccessToken } from './auth';
import { sanitizeObject } from '../utils/security';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    // Security/Safety Fix:
    // - In PROD: Use the environment variable defined in your host (Hostinger/Netlify)
    // - In DEV: Force localhost:3000 to bypass the incorrect .env.local file (locked)
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000, // 30 seconds default
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
});

// Configure intelligent retry logic
axiosRetry(apiClient, {
    retries: 3, // Retry up to 3 times
    retryDelay: axiosRetry.exponentialDelay, // Exponential backoff
    retryCondition: (error) => {
        // Retry on network errors or 5xx server errors
        return (
            axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            (error.response?.status !== undefined && error.response.status >= 500)
        );
    },
    onRetry: (retryCount, error, requestConfig) => {
        console.log(`Retrying request (${retryCount}/3):`, requestConfig.url);
    },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Request interceptor - Add access token and sanitize input
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Sanitize request data to prevent XSS
        if (config.data && typeof config.data === 'object') {
            config.data = sanitizeObject(config.data);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh on 401
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue this request while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newAccessToken = await refreshAccessToken();

                if (newAccessToken && originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                processQueue(null, newAccessToken);
                isRefreshing = false;

                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as Error, null);
                isRefreshing = false;

                // Refresh failed - logout user
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');

                // Redirect to login
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        // Handle other errors with unified error handler
        handleApiError(error);
        return Promise.reject(error);
    }
);

export default apiClient;
