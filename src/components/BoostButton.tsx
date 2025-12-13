import React from 'react';
import { Zap, Star } from 'lucide-react';

interface BoostButtonProps {
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    isBoosted?: boolean;
}

export const BoostButton: React.FC<BoostButtonProps> = ({
    onClick,
    variant = 'primary',
    size = 'md',
    isBoosted = false,
}) => {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
        primary: isBoosted
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
            : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg',
        secondary: isBoosted
            ? 'border-2 border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
            : 'border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20',
    };

    return (
        <button
            onClick={onClick}
            className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-lg font-bold transition-all
        flex items-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
        >
            {isBoosted ? (
                <>
                    <Star className="w-4 h-4 fill-current" />
                    Boosté
                </>
            ) : (
                <>
                    <Zap className="w-4 h-4" />
                    Booster
                </>
            )}
        </button>
    );
};

export default BoostButton;
