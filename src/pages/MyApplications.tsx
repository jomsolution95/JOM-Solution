import React, { useEffect, useState } from 'react';
import {
    Briefcase, Clock, Eye, CheckCircle, XCircle, Calendar,
    MessageCircle, Send, TrendingUp, AlertCircle, Crown
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';
import { BackButton } from '../components/BackButton';

interface Application {
    _id: string;
    jobId: {
        _id: string;
        title: string;
        companyName: string;
        location: string;
    };
    status: 'sent' | 'viewed' | 'in_progress' | 'rejected' | 'interview' | 'accepted';
    appliedAt: string;
    viewedAt?: string;
    lastUpdated: string;
    timeline: TimelineEvent[];
    messages: Message[];
    canFollowUp: boolean;
    lastFollowUpAt?: string;
}

interface TimelineEvent {
    status: string;
    date: string;
    description: string;
}

interface Message {
    _id: string;
    from: string;
    content: string;
    createdAt: string;
}

const STATUS_CONFIG = {
    sent: {
        label: 'Envoyée',
        icon: Send,
        color: 'blue',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-700 dark:text-blue-300',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
    viewed: {
        label: 'Vue',
        icon: Eye,
        color: 'purple',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-700 dark:text-purple-300',
        iconColor: 'text-purple-600 dark:text-purple-400',
    },
    in_progress: {
        label: 'En cours',
        icon: TrendingUp,
        color: 'yellow',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    rejected: {
        label: 'Refusée',
        icon: XCircle,
        color: 'red',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
        iconColor: 'text-red-600 dark:text-red-400',
    },
    interview: {
        label: 'Entretien',
        icon: Calendar,
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        iconColor: 'text-green-600 dark:text-green-400',
    },
    accepted: {
        label: 'Acceptée',
        icon: CheckCircle,
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        iconColor: 'text-green-600 dark:text-green-400',
    },
};

export const MyApplications: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        loadApplications();
        checkPremiumStatus();
    }, []);

    const loadApplications = async () => {
        try {
            const response = await api.get('/applications/user');
            setApplications(response.data.applications);
        } catch (error) {
            toast.error('Erreur lors du chargement des candidatures');
        } finally {
            setLoading(false);
        }
    };

    const checkPremiumStatus = async () => {
        try {
            const response = await api.get('/premium/status');
            setIsPremium(response.data.isPremium);
        } catch (error) {
            console.error('Error checking premium status:', error);
        }
    };

    const handleFollowUp = async (applicationId: string) => {
        if (!isPremium) {
            toast.error('Fonctionnalité Premium requise');
            return;
        }

        try {
            await api.post(`/applications/${applicationId}/follow-up`);
            toast.success('Relance envoyée au recruteur');
            loadApplications();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors de la relance');
        }
    };

    const filteredApplications = applications.filter((app) => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    const stats = {
        total: applications.length,
        sent: applications.filter((a) => a.status === 'sent').length,
        viewed: applications.filter((a) => a.status === 'viewed').length,
        in_progress: applications.filter((a) => a.status === 'in_progress').length,
        interview: applications.filter((a) => a.status === 'interview').length,
        rejected: applications.filter((a) => a.status === 'rejected').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-primary-600 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton label="Retour" />

                {/* Header */}
                <div className="mt-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-primary-600" />
                        Mes Candidatures
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Suivez l'évolution de vos candidatures
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div
                        onClick={() => setFilter('all')}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${filter === 'all'
                                ? 'bg-primary-600 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-sm opacity-90">Total</div>
                    </div>

                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                        const count = stats[key as keyof typeof stats] || 0;
                        const Icon = config.icon;
                        return (
                            <div
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`p-4 rounded-xl cursor-pointer transition-all ${filter === key
                                        ? `${config.bgColor} border-2 border-${config.color}-500`
                                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className={`w-4 h-4 ${config.iconColor}`} />
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {count}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {config.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Applications List */}
                <div className="space-y-4">
                    {filteredApplications.map((app) => {
                        const config = STATUS_CONFIG[app.status];
                        const Icon = config.icon;

                        return (
                            <div
                                key={app._id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                                {app.jobId.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {app.jobId.companyName} • {app.jobId.location}
                                            </p>
                                        </div>

                                        <div className={`px-3 py-1 rounded-full ${config.bgColor} flex items-center gap-2`}>
                                            <Icon className={`w-4 h-4 ${config.iconColor}`} />
                                            <span className={`text-sm font-medium ${config.textColor}`}>
                                                {config.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Chronologie
                                            </span>
                                        </div>
                                        <div className="relative pl-6 space-y-3">
                                            {app.timeline?.map((event, idx) => (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -left-6 top-1 w-3 h-3 bg-primary-600 rounded-full border-2 border-white dark:border-gray-800" />
                                                    {idx < app.timeline.length - 1 && (
                                                        <div className="absolute -left-5 top-4 w-0.5 h-full bg-gray-300 dark:bg-gray-600" />
                                                    )}
                                                    <div className="text-sm">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {event.description}
                                                        </span>
                                                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                                                            {new Date(event.date).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    {app.messages && app.messages.length > 0 && (
                                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageCircle className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Messages ({app.messages.length})
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {app.messages.slice(0, 2).map((msg) => (
                                                    <div key={msg._id} className="text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium">{msg.from}:</span> {msg.content}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedApp(app)}
                                            className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm"
                                        >
                                            Voir détails
                                        </button>

                                        {app.canFollowUp && (
                                            <button
                                                onClick={() => handleFollowUp(app._id)}
                                                disabled={!isPremium}
                                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${isPremium
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                {isPremium ? (
                                                    <>
                                                        <Send className="w-4 h-4" />
                                                        Relancer
                                                    </>
                                                ) : (
                                                    <>
                                                        <Crown className="w-4 h-4" />
                                                        Premium
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Last Follow-up */}
                                    {app.lastFollowUpAt && (
                                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            Dernière relance : {new Date(app.lastFollowUpAt).toLocaleDateString('fr-FR')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredApplications.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {filter === 'all' ? 'Aucune candidature' : `Aucune candidature ${STATUS_CONFIG[filter as keyof typeof STATUS_CONFIG]?.label.toLowerCase()}`}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {filter === 'all'
                                ? 'Commencez à postuler aux offres qui vous intéressent'
                                : 'Changez de filtre pour voir d\'autres candidatures'}
                        </p>
                    </div>
                )}

                {/* Premium Banner */}
                {!isPremium && (
                    <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <Crown className="w-8 h-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    Passez à Premium pour plus de fonctionnalités
                                </h3>
                                <ul className="space-y-2 mb-4">
                                    <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        Relances automatiques aux recruteurs
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        Statistiques avancées de vos candidatures
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        Alertes en temps réel
                                    </li>
                                </ul>
                                <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-lg hover:shadow-lg transition-all">
                                    Découvrir Premium
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;
