
import React, { useState } from 'react';
import { User, Shield, Database, Settings as SettingsIcon } from 'lucide-react';
import { ProfileSettings } from '../components/ProfileSettings';
import { SecuritySettings } from '../components/SecuritySettings';
import { DataPrivacySettings } from '../components/DataPrivacySettings';

type Tab = 'profile' | 'security' | 'privacy';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    const tabs = [
        { id: 'profile' as Tab, label: 'Profil', icon: User },
        { id: 'security' as Tab, label: 'Sécurité', icon: Shield },
        { id: 'privacy' as Tab, label: 'Données & Confidentialité', icon: Database },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <SettingsIcon className="w-8 h-8 text-primary-600" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Paramètres du Compte
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gérez vos paramètres de profil, de sécurité et de confidentialité
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'profile' && <ProfileSettings />}
                    {activeTab === 'security' && <SecuritySettings />}
                    {activeTab === 'privacy' && <DataPrivacySettings />}
                </div>
            </div>
        </div>
    );
};

export default Settings;
