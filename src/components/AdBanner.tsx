import React, { useEffect, useState } from 'react';
import api from '../api/client';

interface AdData {
    _id: string;
    imageUrl: string;
    targetUrl: string;
    headline: string;
    bodyText?: string;
}

interface AdBannerProps {
    placement: 'home_banner' | 'home_sidebar' | 'social_feed' | 'jobs_listing' | 'jobs_sidebar';
    userContext?: {
        city?: string;
        sector?: string;
        age?: number;
    };
    className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
    placement,
    userContext,
    className = '',
}) => {
    const [ad, setAd] = useState<AdData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAd();
    }, [placement]);

    const loadAd = async () => {
        try {
            const params = new URLSearchParams();
            if (userContext?.city) params.append('city', userContext.city);
            if (userContext?.sector) params.append('sector', userContext.sector);
            if (userContext?.age) params.append('age', userContext.age.toString());

            const response = await api.get(`/ads/placement/${placement}?${params.toString()}`);

            if (response.data.ads && response.data.ads.length > 0) {
                const selectedAd = response.data.ads[0];
                setAd(selectedAd);

                // Log impression
                await api.post('/ads/impression', {
                    campaignId: selectedAd._id,
                    placement,
                    userContext,
                });
            }
        } catch (error) {
            console.error('Error loading ad:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = async () => {
        if (!ad) return;

        try {
            // Log click
            await api.post(`/ads/click/${ad._id}`);

            // Open target URL
            window.open(ad.targetUrl, '_blank');
        } catch (error) {
            console.error('Error logging click:', error);
        }
    };

    if (loading || !ad) {
        return null;
    }

    // Banner style (horizontal)
    if (placement === 'home_banner' || placement === 'jobs_listing') {
        return (
            <div
                onClick={handleClick}
                className={`cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all ${className}`}
            >
                <div className="flex items-center gap-4 p-4">
                    <img
                        src={ad.imageUrl}
                        alt={ad.headline}
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {ad.headline}
                        </h3>
                        {ad.bodyText && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {ad.bodyText}
                            </p>
                        )}
                        <span className="inline-block mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            Sponsorisé
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Sidebar style (vertical)
    if (placement === 'home_sidebar' || placement === 'jobs_sidebar') {
        return (
            <div
                onClick={handleClick}
                className={`cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all ${className}`}
            >
                <img
                    src={ad.imageUrl}
                    alt={ad.headline}
                    className="w-full h-48 object-cover"
                />
                <div className="p-4">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                        {ad.headline}
                    </h3>
                    {ad.bodyText && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                            {ad.bodyText}
                        </p>
                    )}
                    <span className="inline-block text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Sponsorisé
                    </span>
                </div>
            </div>
        );
    }

    // Social feed style (card)
    if (placement === 'social_feed') {
        return (
            <div
                onClick={handleClick}
                className={`cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all ${className}`}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                        Sponsorisé
                    </span>
                </div>
                <img
                    src={ad.imageUrl}
                    alt={ad.headline}
                    className="w-full h-64 object-cover"
                />
                <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {ad.headline}
                    </h3>
                    {ad.bodyText && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {ad.bodyText}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default AdBanner;
