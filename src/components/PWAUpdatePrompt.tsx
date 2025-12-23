import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { X, Download } from 'lucide-react';

export const PWAUpdatePrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);

    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    useEffect(() => {
        if (offlineReady || needRefresh) {
            setShowPrompt(true);
        }
    }, [offlineReady, needRefresh]);

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
        setShowPrompt(false);
    };

    const handleUpdate = () => {
        updateServiceWorker(true);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        {offlineReady ? (
                            <>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                    Prêt pour le hors-ligne
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Vous pouvez maintenant utiliser l'application sans connexion internet.
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                    Nouvelle version disponible
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    Cliquez sur recharger pour mettre à jour.
                                </p>
                                ```
                                <button
                                    onClick={handleUpdate}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Recharger
                                </button>
                            </>
                        )}
                    </div>

                    <button
                        onClick={close}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};
