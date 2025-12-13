// Hotjar tracking utilities

declare global {
    interface Window {
        hj: any;
        _hjSettings: any;
    }
}

// Initialize Hotjar
export const initHotjar = (hjid: number, hjsv: number) => {
    if (!hjid) {
        console.warn('Hotjar ID not provided');
        return;
    }

    (function (h: any, o: any, t: any, j: any, a?: any, r?: any) {
        h.hj =
            h.hj ||
            function () {
                (h.hj.q = h.hj.q || []).push(arguments);
            };
        h._hjSettings = { hjid: hjid, hjsv: hjsv };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script');
        r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
};

// Trigger Hotjar event
export const triggerHotjarEvent = (eventName: string) => {
    if (typeof window.hj === 'function') {
        window.hj('event', eventName);
    }
};

// Identify user in Hotjar
export const identifyHotjarUser = (userId: string, attributes?: Record<string, any>) => {
    if (typeof window.hj === 'function') {
        window.hj('identify', userId, attributes);
    }
};

// Track specific interactions
export const trackHotjarPremiumView = () => {
    triggerHotjarEvent('premium_page_view');
};

export const trackHotjarPremiumUpgrade = (plan: string) => {
    triggerHotjarEvent(`premium_upgrade_${plan}`);
};

export const trackHotjarATSInteraction = (action: string) => {
    triggerHotjarEvent(`ats_${action}`);
};

export const trackHotjarProfileView = (profileType: string) => {
    triggerHotjarEvent(`profile_view_${profileType}`);
};

export const trackHotjarSocialEngagement = (action: string) => {
    triggerHotjarEvent(`social_${action}`);
};

// Virtual page view (for SPAs)
export const trackHotjarPageView = (path: string) => {
    if (typeof window.hj === 'function') {
        window.hj('stateChange', path);
    }
};
