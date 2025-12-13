import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
    if (!measurementId) {
        console.warn('GA Measurement ID not provided');
        return;
    }

    ReactGA.initialize(measurementId, {
        gaOptions: {
            anonymizeIp: true,
        },
    });
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
    const enableAnalytics = (import.meta.env as any)?.VITE_ENABLE_ANALYTICS === 'true';
    if (!enableAnalytics) return;

    ReactGA.send({
        hitType: 'pageview',
        page: path,
        title: title || document.title,
    });
};

// Track events
export const trackEvent = (
    category: string,
    action: string,
    label?: string,
    value?: number
) => {
    const enableAnalytics = (import.meta.env as any)?.VITE_ENABLE_ANALYTICS === 'true';
    if (!enableAnalytics) return;

    ReactGA.event({
        category,
        action,
        label,
        value,
    });
};

// Premium Conversions
export const trackPremiumConversion = (plan: string, price: number) => {
    trackEvent('Premium', 'Conversion', plan, price);

    ReactGA.event('purchase', {
        transaction_id: `premium_${Date.now()}`,
        value: price,
        currency: 'XOF',
        items: [
            {
                item_id: plan,
                item_name: `Premium ${plan}`,
                item_category: 'Subscription',
                price: price,
                quantity: 1,
            },
        ],
    });
};

// Profile Views
export const trackProfileView = (profileId: string, profileType: 'user' | 'company') => {
    trackEvent('Profile', 'View', `${profileType}_${profileId}`);
};

// ATS Interactions
export const trackATSInteraction = (
    action: 'view_job' | 'apply' | 'save' | 'share',
    jobId: string
) => {
    trackEvent('ATS', action, jobId);
};

export const trackApplicationSubmit = (jobId: string, jobTitle: string) => {
    trackEvent('ATS', 'Application_Submit', jobTitle);

    ReactGA.event('generate_lead', {
        value: 1,
        currency: 'XOF',
        job_id: jobId,
        job_title: jobTitle,
    });
};

export const trackApplicationStatusChange = (
    applicationId: string,
    oldStatus: string,
    newStatus: string
) => {
    trackEvent('ATS', 'Status_Change', `${oldStatus}_to_${newStatus}`);
};

// Social Engagement
export const trackSocialEngagement = (
    action: 'like' | 'comment' | 'share' | 'follow',
    contentType: 'post' | 'profile' | 'job' | 'service',
    contentId: string
) => {
    trackEvent('Social', action, `${contentType}_${contentId}`);
};

export const trackPostCreation = (postType: 'text' | 'image' | 'video') => {
    trackEvent('Social', 'Create_Post', postType);
};

export const trackConnection = (action: 'send' | 'accept' | 'reject', userId: string) => {
    trackEvent('Social', `Connection_${action}`, userId);
};

// Service Marketplace
export const trackServiceView = (serviceId: string, category: string) => {
    trackEvent('Marketplace', 'View_Service', category);

    ReactGA.event('view_item', {
        items: [
            {
                item_id: serviceId,
                item_category: category,
            },
        ],
    });
};

export const trackServiceOrder = (
    serviceId: string,
    serviceTitle: string,
    price: number
) => {
    trackEvent('Marketplace', 'Order_Service', serviceTitle, price);

    ReactGA.event('purchase', {
        transaction_id: `service_${Date.now()}`,
        value: price,
        currency: 'XOF',
        items: [
            {
                item_id: serviceId,
                item_name: serviceTitle,
                item_category: 'Service',
                price: price,
                quantity: 1,
            },
        ],
    });
};

// Search
export const trackSearch = (query: string, category?: string) => {
    trackEvent('Search', 'Query', query);

    ReactGA.event('search', {
        search_term: query,
        search_category: category,
    });
};

// User Actions
export const trackSignUp = (method: 'email' | 'google' | 'facebook') => {
    trackEvent('User', 'Sign_Up', method);

    ReactGA.event('sign_up', {
        method: method,
    });
};

export const trackLogin = (method: 'email' | 'google' | 'facebook') => {
    trackEvent('User', 'Login', method);

    ReactGA.event('login', {
        method: method,
    });
};

// Messaging
export const trackMessage = (action: 'send' | 'receive' | 'read') => {
    trackEvent('Messaging', action);
};

// File Uploads
export const trackFileUpload = (fileType: string, fileSize: number) => {
    trackEvent('Upload', 'File', fileType, Math.round(fileSize / 1024));
};

// Errors
export const trackError = (errorType: string, errorMessage: string) => {
    trackEvent('Error', errorType, errorMessage);
};

// Performance
export const trackPerformance = (metric: string, value: number) => {
    trackEvent('Performance', metric, undefined, Math.round(value));
};

// Custom dimensions
export const setUserProperties = (properties: Record<string, any>) => {
    const enableAnalytics = (import.meta.env as any)?.VITE_ENABLE_ANALYTICS === 'true';
    if (!enableAnalytics) return;

    ReactGA.set(properties);
};

// User ID tracking
export const setUserId = (userId: string) => {
    const enableAnalytics = (import.meta.env as any)?.VITE_ENABLE_ANALYTICS === 'true';
    if (!enableAnalytics) return;

    ReactGA.set({ userId });
};
