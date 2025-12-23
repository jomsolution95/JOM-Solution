import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    Users, Briefcase, ShoppingBag, CreditCard, TrendingUp,
    MapPin, Clock, CheckCircle2, Star, Zap, Eye, MousePointer
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, subtext, trend }: any) => (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 group">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        <div className="relative z-10 flex justify-between items-start mb-4">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-').replace('500', '600')} dark:text-white`} />
            </div>
        </div>
        <div className="relative z-10 flex items-center text-xs">
            <span className={`flex items-center font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                {subtext}
            </span>
            <span className="text-gray-400 ml-2">vs periode précédente</span>
        </div>
    </div>
);

export const AnalyticsPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Determine endpoint based on role
                const isCompany = user?.roles.includes('company');
                const isSchool = user?.roles.includes('etablissement');
                const endpoint = isCompany ? '/stats/recruitment' : isSchool ? '/stats/academy' : '/stats/profile';

                const { data } = await api.get(endpoint);
                setStats(data.stats);

                // Process chart data
                if (data.stats?.applicationsByDate) {
                    const mapped = data.stats.applicationsByDate.map((d: any) => ({
                        name: new Date(d._id).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                        value: d.count
                    }));
                    setChartData(mapped);
                } else if (data.stats?.progressDistribution) {
                    const mapped = data.stats.progressDistribution.map((d: any) => ({
                        name: `${d._id}%`,
                        value: d.count
                    }));
                    setChartData(mapped);
                }

            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    const isCompany = user?.roles.includes('company');
    const isSchool = user?.roles.includes('etablissement');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <BackButton label="Retour au tableau de bord" onClick={() => navigate('/dashboard')} />

                <div className="mt-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Statistiques & Performances
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Analysez vos résultats et optimisez votre activité en temps réel.
                    </p>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {isCompany ? (
                        <>
                            <StatCard title="Vues des Offres" value={stats?.views || 0} icon={Eye} color="bg-blue-500" trend="up" subtext="Vues" />
                            <StatCard title="Candidatures" value={stats?.totalApplications || 0} icon={Users} color="bg-purple-500" trend="up" subtext="Reçues" />
                            <StatCard title="Taux de Clic" value="0%" icon={MousePointer} color="bg-green-500" trend="up" subtext="CTR" />
                            <StatCard title="Taux Conv." value={`${stats?.conversionRate || 0}%`} icon={Zap} color="bg-orange-500" trend="up" subtext="Embauches" />
                        </>
                    ) : isSchool ? (
                        <>
                            <StatCard title="Étudiants Actifs" value={stats?.totalEnrollments || 0} icon={Users} color="bg-blue-500" trend="up" subtext="Inscrits" />
                            <StatCard title="Cours Rejoints" value={stats?.coursesJoined || 0} icon={Briefcase} color="bg-indigo-500" trend="up" subtext="Actifs" />
                            <StatCard title="Certificats" value={stats?.completedCourses || 0} icon={CheckCircle2} color="bg-green-500" trend="up" subtext="Délivrés" />
                            <StatCard title="Engagement" value={`${stats?.completionRate || 0}%`} icon={Star} color="bg-yellow-500" trend="up" subtext="Complétion" />
                        </>
                    ) : (
                        <>
                            <StatCard title="Profil Vues" value={stats?.profileViews || 0} icon={Eye} color="bg-blue-500" trend="up" subtext="Ce mois" />
                            <StatCard title="Candidatures" value={stats?.applications?.total || 0} icon={Briefcase} color="bg-green-500" trend="up" subtext="Envoyées" />
                            <StatCard title="Commandes" value={stats?.orders?.active || 0} icon={ShoppingBag} color="bg-purple-500" trend="down" subtext="Actives" />
                            <StatCard title="Dépenses" value={stats?.expenses?.month ? `${stats.expenses.month} F` : '0 F'} icon={CreditCard} color="bg-orange-500" trend="up" subtext="Total" />
                        </>
                    )}
                </div>

                {/* Main Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                            {isCompany ? 'Évolution des Candidatures' : isSchool ? 'Progression des Étudiants' : 'Activité du Profil'}
                        </h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorStats" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorStats)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Répartition
                            </h3>
                            <div className="h-[250px] flex items-center justify-center">
                                <div className="relative w-40 h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[{ name: 'A', value: 400 }, { name: 'B', value: 300 }, { name: 'C', value: 300 }]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                <Cell fill="#3B82F6" />
                                                <Cell fill="#10B981" />
                                                <Cell fill="#F59E0B" />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">100%</span>
                                        <span className="text-xs text-gray-500">Global</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Type A</span>
                                    <span className="font-bold">40%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Type B</span>
                                    <span className="font-bold">30%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Type C</span>
                                    <span className="font-bold">30%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
