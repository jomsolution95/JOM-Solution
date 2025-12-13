import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';
import { trackHotjarPageView } from '../utils/hotjar';

export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Track page view in Google Analytics
        trackPageView(location.pathname + location.search, document.title);

        // Track page view in Hotjar
        trackHotjarPageView(location.pathname);
    }, [location]);
};
