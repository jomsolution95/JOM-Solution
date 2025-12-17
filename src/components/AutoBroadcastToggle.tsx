import React, { useState } from 'react';
import {
    Megaphone, Radio, Bell, Home, Share2, Zap, Info
} from 'lucide-react';
import { PremiumBadge } from './PremiumBadge';

interface AutoBroadcastToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    isPremium?: boolean;
}

export const AutoBroadcastToggle: React.FC<AutoBroadcastToggleProps> = ({
    enabled,
    onChange,
    isPremium = false,
}) => {
    const [showInfo, setShowInfo] = useState(false);

    if (!isPremium) {
        return (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Megaphone className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                            Diffusion automatique (Premium)
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Passez à Premium pour diffuser automatiquement vos offres sur tous les canaux JOM
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            Diffusion Automatique
                            Diffusion Automatique
                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-500 text-xs font-bold rounded-full border border-yellow-200 dark:border-yellow-700/50">
                                <PremiumBadge size={12} /> PREMIUM
                            </span>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Maximisez la visibilité de votre offre
                        </p>
                    </div>
                </div>

                {/* Toggle Switch */}
                <button
                    onClick={() => onChange(!enabled)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${enabled
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                >
                    <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {/* Features List */}
            {enabled && (
                <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Radio className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Réseau JOM
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Publication automatique sur le fil d'actualité
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Home className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                Carrousel Homepage
                            </p>
                            <p className="text-xs text-purple-700 dark:text-purple-300">
                                Mise en avant sur la page d'accueil pendant 7 jours
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Bell className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                Notifications Push
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300">
                                Envoi ciblé aux talents correspondants
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <Share2 className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                Partage Social
                            </p>
                            <p className="text-xs text-orange-700 dark:text-orange-300">
                                Diffusion sur les réseaux sociaux connectés
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {enabled
                        ? 'La diffusion sera automatique dès la publication de l\'offre'
                        : 'Activez pour diffuser automatiquement sur tous les canaux JOM'}
                </p>
            </div>

            {/* Stats Preview (if enabled) */}
            {enabled && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span>
                            Portée estimée : <span className="font-bold text-gray-900 dark:text-white">2,500+</span> talents
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutoBroadcastToggle;
