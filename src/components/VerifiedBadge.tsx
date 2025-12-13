import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
    size = 'md',
    showLabel = false,
    className = '',
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const iconSize = sizeClasses[size];

    if (showLabel) {
        return (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full ${className}`}>
                <Shield className={`${iconSize} text-blue-600 dark:text-blue-400`} />
                <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400 absolute -top-0.5 -right-0.5" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Vérifié
                </span>
            </div>
        );
    }

    return (
        <div className={`relative inline-block ${className}`} title="Profil vérifié">
            <Shield className={`${iconSize} text-blue-600 dark:text-blue-400`} />
            <CheckCircle className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 absolute -top-0.5 -right-0.5 bg-white dark:bg-gray-800 rounded-full" />
        </div>
    );
};

export default VerifiedBadge;
