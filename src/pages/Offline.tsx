import React from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Offline: React.FC = () => {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="p-6 bg-gray-200 dark:bg-gray-800 rounded-full">
                        <WifiOff className="w-16 h-16 text-gray-600 dark:text-gray-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    You're Offline
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    It looks like you've lost your internet connection. Some features may not be available until you're back online.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Tip:</strong> You can still browse previously viewed pages and content that's been cached.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors w-full sm:w-auto"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </button>

                    <Link
                        to="/"
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-colors w-full sm:w-auto"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Available Offline:
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <li>✓ Previously viewed pages</li>
                        <li>✓ Cached messages</li>
                        <li>✓ Saved content</li>
                        <li>✓ Your profile</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
