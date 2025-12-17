import React from 'react';
import { Star } from 'lucide-react';

interface PremiumBadgeProps {
    size?: number;
    className?: string;
    tooltip?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
    size = 16,
    className = "",
    tooltip = "Fonctionnalité Premium"
}) => {
    return (
        <div className={`relative inline-flex items-center justify-center group ${className}`} title={tooltip}>
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm opacity-50 animate-pulse"></div>
            <Star
                size={size}
                className="relative z-10 text-yellow-500 fill-yellow-400 drop-shadow-md animate-pulse"
                style={{ animationDuration: '3s' }}
            />
            <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
        </div>
    );
};
