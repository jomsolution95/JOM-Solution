import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, DollarSign, Activity, Lock, LogOut, Ban, CheckCircle } from 'lucide-react';
import api from '../api/client';

interface AdminStats {
    users: number;
    escrowHeld: number;
    orders: number;
    pendingVerifications: number;
}

interface UserData {
    _id: string;
    email: string;
    roles: string[];
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
}

export const SuperAdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<UserData[]>([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBanUser = async (userId: string) => {
        if (!window.confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ? Cette action est irréversible (presque).')) return;
        try {
            await api.post(`/admin/users/${userId}/ban`);
            setUsers(users.map(u => u._id === userId ? { ...u, isActive: false } : u));
        } catch (err) {
            alert('Erreur lors du bannissement');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/super-admin');
    };

    const renderContent = () => {
        if (activeTab === 'overview') {
            return (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Utilisateurs Totaux', value: stats?.users || 0, trend: 'Actifs', color: 'blue' },
                            { label: 'Fonds Séquestrés', value: `${stats?.escrowHeld || 0} FCFA`, trend: 'En attente', color: 'yellow' },
                            { label: 'Commandes Totales', value: stats?.orders || 0, trend: 'Global', color: 'green' },
                            { label: 'Vérifications', value: stats?.pendingVerifications || 0, trend: 'En attente', color: 'red' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2">{stat.label}</p>
                                <div className="flex items-end justify-between">
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                    <span className={`text-xs px-2 py-1 rounded bg-${stat.color}-900/30 text-${stat.color}-400`}>
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (activeTab === 'users') {
            return (
                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="font-bold">Registre des Utilisateurs</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-950 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">ID / Email</th>
                                    <th className="px-6 py-3">Rôles</th>
                                    <th className="px-6 py-3">Statut</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan={4} className="text-center p-4">Chargement...</td></tr>
                                ) : users.map((u) => (
                                    <tr key={u._id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono">
                                            <div className="text-white">{u.email}</div>
                                            <div className="text-gray-600 text-xs">{u._id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.roles.map(r => (
                                                <span key={r} className="inline-block bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded mr-1">
                                                    {r}
                                                </span>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.isActive ? (
                                                <span className="flex items-center gap-1 text-green-500 text-xs"><CheckCircle className="w-3 h-3" /> Actif</span>
                                            ) : (
                                                <span className="text-red-500 text-xs">Banni</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.isActive && !u.roles.includes('super_admin') && (
                                                <button
                                                    onClick={() => handleBanUser(u._id)}
                                                    className="bg-red-900/30 hover:bg-red-900/50 text-red-500 border border-red-500/30 px-3 py-1 rounded text-xs transition-colors"
                                                >
                                                    BANNIR
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return <div className="p-8 text-center text-gray-500">Module en construction...</div>;
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans">
            {/* Top Bar */}
            <header className="bg-black border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center font-bold text-lg shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                        SA
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-wide">JOM GOD MODE</h1>
                        <p className="text-xs text-gray-400 font-mono">ROOT ACCESS GRANTED</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-red-900/30 text-red-400 px-3 py-1 rounded text-xs border border-red-500/30 font-mono animate-pulse">
                        LIVE SYSTEM
                    </span>
                    <button onClick={handleLogout} className="flex items-center gap-2 hover:text-red-400 transition-colors text-sm">
                        <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                </div>
            </header>

            <div className="flex h-[calc(100vh-73px)]">
                {/* Sidebar */}
                <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 hidden md:block">
                    <nav className="space-y-1">
                        {[
                            { id: 'overview', icon: Activity, label: 'Vue d\'ensemble' },
                            { id: 'users', icon: Users, label: 'Police (Utilisateurs)' },
                            { id: 'escrow', icon: DollarSign, label: 'Finances & Escrow' },
                            { id: 'logs', icon: Lock, label: 'Audit Logs' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === item.id
                                    ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto bg-gray-950 p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
