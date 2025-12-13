import React, { useEffect, useState } from 'react';
import {
    Briefcase, Users, TrendingUp, Clock, Target, Award,
    BarChart3, Activity, CheckCircle
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api/client';
import { BackButton } from '../components/BackButton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const RecruitmentDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await api.get('/stats/recruitment');
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
    const applicationsByDate = [
        { date: '2024-12-01', count: 12 },
        { date: '2024-12-02', count: 15 },
        { date: '2024-12-03', count: 8 },
        { date: '2024-12-04', count: 20 },
        { date: '2024-12-05', count: 18 },
        { date: '2024-12-06', count: 25 },
        { date: '2024-12-07', count: 22 },
    ];

    const applicationsByStatus = [
        { name: 'En attente', value: 45, color: '#f59e0b' },
        { name: 'Présélection', value: 28, color: '#3b82f6' },
        { name: 'Entretien', value: 15, color: '#8b5cf6' },
        { name: 'Offre', value: 8, color: '#10b981' },
        { name: 'Embauché', value: 12, color: '#22c55e' },
        { name: 'Rejeté', value: 32, color: '#ef4444' },
    ];

    const topPerformingJobs = [
        { title: 'Développeur Full Stack', applications: 85, conversion: 12 },
        { title: 'Designer UI/UX', applications: 62, conversion: 8 },
        { title: 'Chef de Projet', applications: 48, conversion: 6 },
        { title: 'Data Analyst', applications: 41, conversion: 5 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton label="Retour" />

                {/* Header */}
                <div className="mt-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary-600" />
                        Dashboard Recrutement
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Analysez les performances de vos campagnes de recrutement
                    </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">24</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Annonces actives</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">342</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Candidatures totales</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">8.5%</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Taux de conversion</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">12j</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Temps moyen d'embauche</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Applications Over Time */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Candidatures par jour
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={applicationsByDate}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="Candidatures"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Applications by Status */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Répartition par statut
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={applicationsByStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {applicationsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performing Jobs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Annonces les plus performantes
                    </h3>
                    <div className="space-y-4">
                        {topPerformingJobs.map((job, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {job.applications} candidatures
                                            </span>
                                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                {job.conversion} embauches
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                        {((job.conversion / job.applications) * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-gray-500">Conversion</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recruiter Performance */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Performance des recruteurs
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Recruteur
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Annonces
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Candidatures
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Embauches
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Temps moyen
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { name: 'Marie Diop', jobs: 8, applications: 124, hires: 12, avgTime: '10j' },
                                    { name: 'Amadou Fall', jobs: 6, applications: 98, hires: 9, avgTime: '14j' },
                                    { name: 'Fatou Sall', jobs: 10, applications: 156, hires: 15, avgTime: '11j' },
                                ].map((recruiter, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {recruiter.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {recruiter.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-center py-3 px-4 text-gray-900 dark:text-white">
                                            {recruiter.jobs}
                                        </td>
                                        <td className="text-center py-3 px-4 text-gray-900 dark:text-white">
                                            {recruiter.applications}
                                        </td>
                                        <td className="text-center py-3 px-4">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                                                <CheckCircle className="w-3 h-3" />
                                                {recruiter.hires}
                                            </span>
                                        </td>
                                        <td className="text-center py-3 px-4 text-gray-900 dark:text-white">
                                            {recruiter.avgTime}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruitmentDashboard;
