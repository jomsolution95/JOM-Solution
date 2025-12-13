/**
 * APP.TSX ANALYTICS INTEGRATION EXAMPLE
 * 
 * This shows how to integrate analytics into your main App.tsx file.
 * Copy the relevant parts into your actual App.tsx.
 * 
 * NOTE: This is an example file for reference only.
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initGA } from '../utils/analytics';
import { initHotjar } from '../utils/hotjar';
import { usePageTracking } from '../hooks/usePageTracking';
import { setUserId, setUserProperties } from '../utils/analytics';
import { identifyHotjarUser } from '../utils/hotjar';

// Mock auth hook for example - replace with your actual auth context
const useAuth = () => ({
    user: null as any,
    isAuthenticated: false,
});

const queryClient = new QueryClient();

// Analytics Wrapper Component
const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    usePageTracking();

    // Identify user when authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            setUserId(user.id);
            setUserProperties({
                user_type: user.isPremium ? 'premium' : 'free',
                account_age_days: Math.floor(
                    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                ),
            });

            identifyHotjarUser(user.id, {
                email: user.email,
                name: user.name,
                plan: user.isPremium ? 'premium' : 'free',
            });
        }
    }, [isAuthenticated, user]);

    return <>{children}</>;
};

function AppExample() {
    useEffect(() => {
        // Initialize analytics on app start
        const enableAnalytics = (import.meta.env as any)?.VITE_ENABLE_ANALYTICS === 'true';

        if (enableAnalytics) {
            const gaId = (import.meta.env as any)?.VITE_GA_MEASUREMENT_ID as string;
            const hjId = parseInt((import.meta.env as any)?.VITE_HOTJAR_ID as string);
            const hjSv = parseInt((import.meta.env as any)?.VITE_HOTJAR_SV as string);

            if (gaId) initGA(gaId);
            if (hjId && hjSv) initHotjar(hjId, hjSv);
        }
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <AnalyticsProvider>
                    {/* Your app routes */}
                </AnalyticsProvider>
            </Router>
        </QueryClientProvider>
    );
}

export default AppExample;
