import React, { useEffect, useState } from 'react';
import {
    GraduationCap, Users, TrendingUp, Award, BookOpen,
    BarChart3, Activity, AlertTriangle, Clock
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import api from '../api/client';
import { BackButton } from '../components/BackButton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const AcademyDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await api.get('/stats/academy');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Activity className="w-12 h-12 text-primary-600 animate-spin" />
            </div>
        );
    }

    // Mock data for demonstration
    const progressDistribution = [
        { range: '0-25%', count: 45 },
        { range: '25-50%', count: 32 },
        { range: '50-75%', count: 28 },
        { range: '75-100%', count: 65 },
    ];

    const enrollmentsByCourse = [
        { name: 'Développement Web', enrollments: 156, completion: 78 },
        { name: 'Data Science', enrollments: 124, completion: 65 },
        { name: 'Design UX/UI', enrollments: 98, completion: 82 },
        { name: 'Marketing Digital', enrollments: 142, completion: 91 },
    ];

    const abandonedModules = [
        { name: 'JavaScript Avancé', abandonCount: 42 },
        { name: 'Algorithmes', abandonCount: 38 },
        { name: 'Base de données', abandonCount: 31 },
        { name: 'Machine Learning', abandonCount: 28 },
    ];

    // Heatmap data (day of week x hour)
    const heatmapData = Array.from({ length: 7 }, (_, day) =>
        Array.from({ length: 24 }, (_, hour) => ({
            day,
            hour,
            value: Math.floor(Math.random() * 50),
        }))
    ).flat();

    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton label="Retour" />

                {/* Header */}
                <div className="mt-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-primary-600" />
                        Dashboard Academy
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Suivez les performances de vos formations
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {stats?.totalEnrollments || 520}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Inscriptions totales</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {stats?.completionRate || 76}%
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Taux de complétion</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {stats?.avgProgress || 68}%
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Progression moyenne</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {stats?.completedCourses || 395}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cours complétés</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Progress Distribution */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Distribution de la progression
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={progressDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="range" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="count" name="Étudiants">
                                    {progressDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Enrollments by Course */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Inscriptions par cours
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={enrollmentsByCourse} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                                <YAxis dataKey="name" type="category" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} width={120} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="enrollments" fill="#3b82f6" name="Inscriptions" />
                                <Bar dataKey="completion" fill="#10b981" name="Complétés" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Abandoned Modules */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Modules les plus abandonnés
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {abandonedModules.map((module, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">{module.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                        {module.abandonCount}
                                    </span>
                                    <span className="text-sm text-gray-500">abandons</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-primary-600" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Heatmap d'activité (Jour x Heure)
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="inline-grid gap-1" style={{ gridTemplateColumns: 'auto repeat(24, minmax(24px, 1fr))' }}>
                            {/* Header row with hours */}
                            <div></div>
                            {Array.from({ length: 24 }, (_, i) => (
                                <div key={i} className="text-xs text-center text-gray-500 dark:text-gray-400 pb-2">
                                    {i}h
                                </div>
                            ))}

                            {/* Heatmap cells */}
                            {dayNames.map((day, dayIdx) => (
                                <React.Fragment key={dayIdx}>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 pr-2 flex items-center justify-end">
                                        {day}
                                    </div>
                                    {Array.from({ length: 24 }, (_, hourIdx) => {
                                        const cell = heatmapData.find(d => d.day === dayIdx && d.hour === hourIdx);
                                        const intensity = cell ? Math.min(cell.value / 50, 1) : 0;
                                        const bgColor = `rgba(59, 130, 246, ${intensity})`;

                                        return (
                                            <div
                                                key={hourIdx}
                                                className="w-6 h-6 rounded cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all"
                                                style={{ backgroundColor: bgColor }}
                                                title={`${day} ${hourIdx}h: ${cell?.value || 0} activités`}
                                            />
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>Moins actif</span>
                            <div className="flex gap-1">
                                {[0, 0.25, 0.5, 0.75, 1].map((intensity, idx) => (
                                    <div
                                        key={idx}
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: `rgba(59, 130, 246, ${intensity})` }}
                                    />
                                ))}
                            </div>
                            <span>Plus actif</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcademyDashboard;
