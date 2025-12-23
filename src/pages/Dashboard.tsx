
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link, useLocation } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  DollarSign, Users, ShoppingBag, Briefcase, Settings, CreditCard,
  FileText, GraduationCap, Heart, Crown, TrendingUp, Calendar, MessageSquare,
  User, LayoutDashboard, ArrowUpRight, Plus, ChevronRight, Clock, Search, Zap, CheckCircle2, Star, Video, Rocket
} from 'lucide-react';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { PremiumBadge } from '../components/PremiumBadge';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

// --- DESIGN COMPONENTS ---

const QuickAction = ({ icon: Icon, label, to, color, ...props }: { icon: any, label: string, to: string, color: string, [key: string]: any }) => (
  <Link
    to={to}
    {...props}
    className="group flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
  >
    <div className={`p-3 rounded-xl mb-3 ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-').replace('500', '600')} dark:text-white`} />
    </div>
    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 text-center">{label}</span>
  </Link>
);

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
      <span className="text-gray-400 ml-2">vs mois dernier</span>
    </div>
  </div>
);

const PremiumCard = () => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-gray-800 dark:to-gray-900 text-white shadow-lg p-6 flex flex-col justify-center items-center gap-6 h-auto min-h-[280px]">
    {/* Abstract shapes */}
    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

    <div className="relative z-10 text-center">
      <div className="inline-flex items-center gap-2 mb-4 bg-yellow-500/20 p-1.5 rounded-lg backdrop-blur-sm border border-yellow-500/30">
        <PremiumBadge size={20} />
        <span className="text-yellow-400 font-bold text-xs tracking-wider uppercase">Offre Limitée</span>
      </div>
      <h3 className="text-xl font-bold mb-3">Débloquez tout le potentiel</h3>
      <p className="text-gray-300 text-xs leading-relaxed max-w-[200px] mx-auto">Accédez aux analytics avancés, réduisez vos commissions et gagnez en visibilité avec JOM Premium.</p>
    </div>

    <Link to="/premium" className="relative z-10 group bg-white text-gray-900 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105 w-full">
      Passer Premium <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </Link>
  </div>
);

const SectionHeader = ({ title, linkText, linkTo }: { title: string, linkText?: string, linkTo?: string }) => (
  <div className="flex justify-between items-end mb-6">
    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
    {linkText && linkTo && (
      <Link to={linkTo} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:underline">
        {linkText} <ChevronRight className="w-4 h-4" />
      </Link>
    )}
  </div>
);

// --- DASHBOARD VIEWS ---

const IndividualDashboard = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/profile');
        setStats(data.stats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction icon={Search} label="Trouver un Service" to="/services" color="bg-blue-500" data-tour="service-search-link" />
        <QuickAction icon={FileText} label="Créer mon CV" to="/cv-builder" color="bg-blue-600" />
        <QuickAction icon={Briefcase} label="Offres d'Emploi" to="/jobs" color="bg-green-500" data-tour="job-search-link" />
        <QuickAction icon={GraduationCap} label="Mes Formations" to="/formations" color="bg-purple-500" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tour="dashboard-stats">
        <StatCard title="Dépenses (Mois)" value={stats?.expenses?.month ? `${stats.expenses.month} F` : '0 F'} icon={CreditCard} color="bg-blue-500" trend="up" subtext="Ce mois" />
        <StatCard title="Commandes" value={stats?.orders?.active || 0} icon={ShoppingBag} color="bg-indigo-500" trend="up" subtext="Actives" />
        <StatCard title="Candidatures" value={stats?.applications?.total || 0} icon={Briefcase} color="bg-green-500" trend="up" subtext="Envoyées" />
        <StatCard title="Certifications" value={stats?.certifications?.total || 0} icon={Crown} color="bg-yellow-500" trend="up" subtext="Obtenues" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Activity Feed */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader title="Activité Récente" linkText="Voir tout" linkTo="/my-items" />
          <div className="py-10 text-center text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Aucune activité récente.</p>
          </div>
        </div>

        {/* Side Widgets */}
        <div className="space-y-6">
          <PremiumCard />
        </div>
      </div>
    </div>
  );
};

const CompanyDashboard = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [chartData, setChartData] = React.useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/recruitment');
        setStats(data.stats);
        if (data.stats?.applicationsByDate) {
          // Map backend date format to chart format
          const mappedData = data.stats.applicationsByDate.map((d: any) => ({
            name: new Date(d._id).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            value: d.count
          }));
          setChartData(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch company stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction icon={Plus} label="Nouveau Service" to="/my-items" color="bg-blue-500" />
        <QuickAction icon={Briefcase} label="Publier Offre" to="/jobs/create" color="bg-purple-500" data-tour="post-job-btn" />
        <QuickAction icon={Search} label="CVthèque" to="/cvtheque/search" color="bg-teal-500" />
        <QuickAction icon={Users} label="Gestion Candidats (ATS)" to="/ats" color="bg-pink-500" />
        <QuickAction icon={TrendingUp} label="Statistiques" to="/analytics" color="bg-orange-500" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Offres Totales" value={stats?.totalJobs || 0} icon={Briefcase} color="bg-green-500" trend="up" subtext="Publiées" />
        <StatCard title="Offres Actives" value={stats?.activeJobs || 0} icon={Zap} color="bg-blue-500" trend="up" subtext="En ligne" />
        <StatCard title="Candidatures" value={stats?.totalApplications || 0} icon={Users} color="bg-purple-500" trend="up" subtext="Reçues" />
        <StatCard title="Taux Conv." value={`${stats?.conversionRate || 0}%`} icon={TrendingUp} color="bg-orange-500" trend="up" subtext="Embauches" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader title="Évolution des Candidatures" />
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <p>Aucune donnée disponible pour le moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Widgets */}
        <div className="space-y-6">
          <PremiumCard />
        </div>
      </div>
    </div>
  );
};

const EtablissementDashboard = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [chartData, setChartData] = React.useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/academy');
        setStats(data.stats);
        if (data.stats?.progressDistribution) {
          const mappedData = data.stats.progressDistribution.map((d: any) => ({
            name: `${d._id}%`,
            value: d.count
          }));
          setChartData(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch academy stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) return <div className="p-8 text-center text-gray-500 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction icon={Plus} label="Nouveau Cours" to="/formations/create" color="bg-indigo-500" />
        <QuickAction icon={Users} label="Gérer Étudiants" to="/academy/students" color="bg-blue-500" />
        <QuickAction icon={Rocket} label="Marketing" to="/academy/marketing" color="bg-purple-500" />
        <QuickAction icon={FileText} label="Certifications" to="/academy/certificates" color="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Étudiants Actifs" value={stats?.totalEnrollments || 0} icon={Users} color="bg-blue-500" trend="up" subtext="Inscrits" />
        <StatCard title="Cours Terminés" value={stats?.completedCourses || 0} icon={CheckCircle2} color="bg-green-500" trend="up" subtext="Total" />
        <StatCard title="Taux Complétion" value={stats?.completionRate ? `${stats.completionRate}%` : '0%'} icon={TrendingUp} color="bg-purple-500" trend="up" subtext="Moyen" />
        <StatCard title="Progression Moy." value={stats?.avgProgress ? `${stats.avgProgress}%` : '0%'} icon={Star} color="bg-yellow-500" trend="up" subtext="Global" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <SectionHeader title="Répartition par Cours" />
          <div className="py-10 text-center text-gray-400">
            <p>Les données détaillées par cours seront disponibles bientôt.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <SectionHeader title="Progression" />
          <div className="flex-1 min-h-[200px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                Pas de données
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



// --- MAIN WRAPPER ---

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { startTour } = useOnboardingStore();

  useEffect(() => {
    if (user) {
      const roles = user.roles || [];
      if (roles.includes('individual') || user.role === 'individual') {
        startTour('candidate_dashboard');
      } else if (roles.includes('company') || user.role === 'company') {
        startTour('recruiter_dashboard');
      } else if (roles.includes('etablissement') || user.role === 'etablissement') {
        startTour('etablissement_dashboard');
      }
    }
  }, [user, startTour]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Helper to determine primary role for dashboard view (re-declared for clarity or lifted if possible, but fine here for now)
  // Actually, better to lift it or use the one inside renderContent? 
  // Let's just fix the header access safely.

  // ... (renderContent is defined below in the file structure order, so we skip that)

  // ... (Menu items defined below)

  // ... (Return statement)

  // Inside the main return block, fixing the shortcuts and header:
  // We need to target the Raccourcis link and Header specifically with separate edits or just include them here if contiguous?
  // They are not contiguous with the block above. I should use a separate replace call for the useEffect and another for the bottom part.

  // EDIT 1: Fix useEffect ONLY here.


  if (!user) {
    return <Navigate to="/login" />;
  }

  // Helper to determine primary role for dashboard view
  const getPrimaryRole = () => {
    const roles = user.roles || [];
    if (roles.includes('company') || user.role === 'company') return 'company';
    if (roles.includes('etablissement') || user.role === 'etablissement') return 'etablissement';
    return 'individual';
  }
  const primaryRole = getPrimaryRole();

  const renderContent = () => {
    switch (primaryRole) {
      case 'company': return <CompanyDashboard />;
      case 'etablissement': return <EtablissementDashboard />;

      default: return <IndividualDashboard />;
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Vue d\'ensemble', path: '/dashboard' },
    { icon: ShoppingBag, label: primaryRole === 'individual' ? 'Mes Commandes' : 'Mes Services', path: '/my-items' },
    { icon: Users, label: 'Réseaux', path: '/reseaux' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: CreditCard, label: 'Facturation', path: '/billing' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-gray-900 transition-colors duration-300">
      {/* Modern Sticky Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 pt-6 pb-10 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto z-30 shadow-sm">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-gray-700 rounded-xl border border-primary-100 dark:border-gray-600">
            <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.email}`} alt={user.name || user.email} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name || user.email.split('@')[0]}</p>
              <p className="text-xs text-primary-600 dark:text-primary-400 font-medium uppercase tracking-wider truncate">
                {primaryRole === 'individual' ? 'Particulier' : primaryRole === 'company' ? 'Entreprise' : 'Établissement'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 px-4 space-y-1">
          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Menu Principal</div>
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path || '#'}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600"></div>}
              </Link>
            );
          })}

          <div className="my-6 border-t border-gray-100 dark:border-gray-700"></div>

          <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Raccourcis</div>
          <Link to={`/profile/${user._id}`} className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
            <User className="w-5 h-5 text-gray-400" /> Mon Profil Public
          </Link>
          <Link to="/premium" className="mt-2 mx-2 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-700 dark:to-gray-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
            <PremiumBadge size={16} />
            <span className="text-sm font-bold">Passer Premium</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 pt-8 overflow-x-hidden">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Bon retour, {(user.name || user.email).split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Voici ce qui se passe sur votre espace aujourd'hui.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date().toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Animated content entry */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
