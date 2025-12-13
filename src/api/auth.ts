import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Refresh the access token using the refresh token
 * @returns New access token or null if refresh failed
 */
export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const response = await axios.post(
            `${AUTH_API_URL}/auth/refresh`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                },
            }
        );

        const { access_token, refresh_token } = response.data;

        // Store new tokens
        if (access_token) {
            localStorage.setItem('access_token', access_token);
        }
        if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token);
        }

        return access_token;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
};

/**
 * Login user and store tokens
 */
export const login = async (email: string, password: string) => {
    const response = await axios.post(`${AUTH_API_URL}/auth/login`, {
        email,
        password,
    });

    const { access_token, refresh_token, user } = response.data;

    // Store tokens and user data
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
};

/**
 * Logout user and clear tokens
 */
export const logout = async () => {
    try {
        // Call logout endpoint (optional - backend can invalidate refresh token)
        await axios.post(
            `${AUTH_API_URL}/auth/logout`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            }
        );
    } catch (error) {
        console.error('Logout API call failed:', error);
    } finally {
        // Clear local storage regardless of API call result
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('access_token');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};
