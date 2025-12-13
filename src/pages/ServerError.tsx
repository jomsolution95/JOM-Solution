import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export const ServerError: React.FC = () => {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-6 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <AlertTriangle className="w-16 h-16 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                    500
                </h1>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Server Error
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Something went wrong on our end. We're working to fix it. Please try again later.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Retry
                    </button>

                    <Link
                        to="/"
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
};
