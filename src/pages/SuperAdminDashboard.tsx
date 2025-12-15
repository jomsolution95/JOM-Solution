
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Search, Bell, Shield, Wallet, DollarSign, TrendingUp, Tag, CheckCircle, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
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

interface AuditLog {
    _id: string;
    action: string;
    admin: { email: string };
    targetId: string;
    targetModel: string;
    details: any;
    createdAt: string;
}

interface EscrowTx {
    _id: string;
    amount: number;
    status: string;
    order: {
        buyer: { email: string };
        seller: { email: string };
        service: { title: string };
        status: string;
    };
    createdAt: string;
}

interface KYCUser {
    _id: string;
    email: string;
    kycStatus: string;
    kycDocuments: string[];
    createdAt: string;
}

interface AdCampaign {
    _id: string;
    name: string;
    budget: number;
    spent: number;
    status: 'active' | 'paused' | 'completed' | 'draft';
    impressions: number;
    clicks: number;
    placements: string[];
    advertiserId: { _id: string; email: string };
}

interface Coupon {
    _id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    amount: number;
    maxUses?: number;
    usedCount: number;
    expiryDate?: string;
    isActive: boolean;
}

export const SuperAdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<UserData[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [escrows, setEscrows] = useState<EscrowTx[]>([]);
    const [kycUsers, setKycUsers] = useState<KYCUser[]>([]);
    const [ads, setAds] = useState<AdCampaign[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [newCoupon, setNewCoupon] = useState({ code: '', discountType: 'PERCENTAGE', amount: 0, maxUses: 0, expiryDate: '' });
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'logs') fetchLogs();
        if (activeTab === 'escrow') fetchEscrows();
        if (activeTab === 'kyc') fetchPendingKYC();
        if (activeTab === 'ads') fetchAds();
        if (activeTab === 'coupons') fetchCoupons();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/logs');
            setLogs(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEscrows = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/finances/escrow');
            setEscrows(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingKYC = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/kyc/pending');
            setKycUsers(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/ads');
            setAds(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/coupons');
            setCoupons(res.data.data);
        } catch (error) {
            console.error('Error fetching coupons', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/coupons', newCoupon);
            fetchCoupons();
            setNewCoupon({ code: '', discountType: 'PERCENTAGE', amount: 0, maxUses: 0, expiryDate: '' });
            toast.success('Coupon créé !');
        } catch (error) {
            toast.error('Erreur création coupon');
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!window.confirm('Supprimer ce coupon ?')) return;
        try {
            await api.delete(`/ admin / coupons / ${id} `);
            fetchCoupons();
        } catch (error) {
            toast.error('Erreur suppression');
        }
    };

    const handleKYCReview = async (userId: string, decision: 'APPROVE' | 'REJECT') => {
        let reason = undefined;
        if (decision === 'REJECT') {
            reason = prompt('Motif du rejet :');
            if (!reason) return;
        }

        if (!window.confirm(`Confirmer la décision: ${decision}?`)) return;

        try {
            await api.post(`/admin/kyc/${userId}/review`, { decision, reason });
            toast.success('Décision enregistrée.');
            fetchPendingKYC();
        } catch (err) {
            toast.error('Erreur lors du traitement.');
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
            toast.error('Erreur lors du bannissement');
        }
    };

    const handleAdReview = async (id: string, action: 'APPROVE' | 'REJECT' | 'STOP') => {
        if (!window.confirm(`Confirmer l'action: ${action}?`)) return;
        try {
            await api.post(`/admin/ads/${id}/review`, { action });
            await fetchAds();
            toast.success('Action effectuée');
        } catch (err) {
            toast.error('Erreur');
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

        if (activeTab === 'logs') {
            return (
                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="font-bold">Journal d'Audit (Logs)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-950 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Admin</th>
                                    <th className="px-6 py-3">Action</th>
                                    <th className="px-6 py-3">Cible</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan={4} className="text-center p-4">Chargement...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center p-4 text-gray-500">Aucun log trouvé.</td></tr>
                                ) : logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-800/50">
                                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-blue-400">{log.admin?.email || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-purple-900/30 text-purple-400 px-2 py-1 rounded text-xs border border-purple-500/20">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">
                                            {log.targetModel}: {log.targetId}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (activeTab === 'escrow') {
            return (
                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="font-bold">Fonds Séquestrés (Escrow)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-950 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Commande</th>
                                    <th className="px-6 py-3">Montant</th>
                                    <th className="px-6 py-3">Acheteur / Vendeur</th>
                                    <th className="px-6 py-3">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan={4} className="text-center p-4">Chargement...</td></tr>
                                ) : escrows.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center p-4 text-gray-500">Aucune transaction trouvée.</td></tr>
                                ) : escrows.map((tx) => (
                                    <tr key={tx._id} className="hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">{tx.order?.service?.title || 'Service Supprimé'}</div>
                                            <div className="text-xs text-gray-600 font-mono">{tx._id}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-400">
                                            {tx.amount?.toLocaleString()} FCFA
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div className="text-gray-300">A: {tx.order?.buyer?.email}</div>
                                            <div className="text-gray-500">V: {tx.order?.seller?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs border ${tx.status === 'held' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/20' :
                                                tx.status === 'released' ? 'bg-green-900/30 text-green-400 border-green-500/20' :
                                                    'bg-gray-800 text-gray-400'
                                                }`}>
                                                {tx.status.toUpperCase()}
                                            </span>

                                            {tx.status === 'held' && (
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        onClick={async () => {
                                                            if (!window.confirm('Action irréversible : RELÂCHER les fonds au vendeur ?')) return;
                                                            try {
                                                                await api.post(`/admin/finances/escrow/${tx._id}/resolve`, { decision: 'RELEASE' });
                                                                toast.success('Fonds libérés avec succès.');
                                                                fetchEscrows();
                                                            } catch (e) { toast.error('Erreur'); }
                                                        }}
                                                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                                                        title="Forcer le paiement au vendeur"
                                                    >
                                                        Libérer
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (!window.confirm('Action irréversible : REMBOURSER l\'acheteur ?')) return;
                                                            try {
                                                                await api.post(`/admin/finances/escrow/${tx._id}/resolve`, { decision: 'REFUND' });
                                                                toast.success('Remboursement effectué.');
                                                                fetchEscrows();
                                                            } catch (e) { toast.error('Erreur'); }
                                                        }}
                                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                                                        title="Forcer le remboursement client"
                                                    >
                                                        Rembourser
                                                    </button>
                                                </div>
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

        if (activeTab === 'kyc') {
            return (
                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="font-bold">Vérifications d'Identité (KYC)</h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full text-center">Chargement...</div>
                        ) : kycUsers.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-8">Aucune demande en attente.</div>
                        ) : kycUsers.map((u) => (
                            <div key={u._id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-white">{u.email}</h4>
                                        <p className="text-xs text-gray-400">ID: {u._id}</p>
                                        <p className="text-xs text-gray-400">Date: {new Date(u.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className="bg-orange-900/30 text-orange-400 text-xs px-2 py-1 rounded border border-orange-500/20">
                                        PENDING
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Documents :</p>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {u.kycDocuments?.map((doc, i) => (
                                            <a key={i} href={doc} target="_blank" rel="noopener noreferrer" className="block w-20 h-14 bg-gray-900 rounded border border-gray-600 hover:border-blue-500 transition-colors flex items-center justify-center text-xs text-blue-400">
                                                Doc {i + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <button
                                        onClick={() => handleKYCReview(u._id, 'REJECT')}
                                        className="bg-red-900/30 hover:bg-red-900/50 text-red-500 border border-red-500/30 py-2 rounded text-xs transition-colors"
                                    >
                                        REJETER
                                    </button>
                                    <button
                                        onClick={() => handleKYCReview(u._id, 'APPROVE')}
                                        className="bg-green-900/30 hover:bg-green-900/50 text-green-500 border border-green-500/30 py-2 rounded text-xs transition-colors"
                                    >
                                        VALIDER
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (activeTab === 'broadcast') {
            return (
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl border border-gray-700 p-8 shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-red-600/20 p-3 rounded-full border border-red-500/50">
                                <Bell className="w-8 h-8 text-red-500 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white">Centre de Diffusion (Broadcast V2)</h3>
                                <p className="text-gray-400">Envoyez ou programmez des annonces globales avec ciblage précis.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left: Content */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Titre du Message</label>
                                    <input
                                        id="broadcastTitle"
                                        type="text"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 outline-none focus:ring-1 focus:ring-red-500 transition-all"
                                        placeholder="Ex: Maintenance Prévue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Contenu</label>
                                    <textarea
                                        id="broadcastMessage"
                                        className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white h-40 focus:border-red-500 outline-none focus:ring-1 focus:ring-red-500 transition-all"
                                        placeholder="Votre message ici..."
                                    ></textarea>
                                </div>
                            </div>

                            {/* Right: Targeting & Schedule */}
                            <div className="space-y-6 bg-black/20 p-6 rounded-lg border border-gray-700/50">
                                <h4 className="font-semibold text-red-400 text-sm uppercase tracking-wider mb-4">Ciblage & Planification</h4>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Cible Principale (Rôle)</label>
                                    <select
                                        id="broadcastRole"
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2.5 text-white focus:border-red-500 outline-none"
                                    >
                                        <option value="ALL">📢 Tous les utilisateurs</option>
                                        <option value="individual">👤 Individuels</option>
                                        <option value="company">🏢 Entreprises</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Filtres Avancés</p>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" id="filterVerified" className="w-4 h-4 rounded border-gray-600 text-red-600 focus:ring-red-500 bg-gray-900" />
                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Comptes Vérifiés Uniquement</span>
                                    </label>
                                    {/* Placeholder for Premium Filter */}
                                    <label className="flex items-center gap-3 cursor-pointer group opacity-50 cursor-not-allowed" title="Nécessite le module Premium">
                                        <input type="checkbox" disabled className="w-4 h-4 rounded border-gray-600 bg-gray-800" />
                                        <span className="text-sm text-gray-500">Membres Premium (Bientôt)</span>
                                    </label>
                                </div>

                                <div className="pt-4 border-t border-gray-700">
                                    <label className="block text-sm text-gray-400 mb-2">Planifier pour plus tard (Optionnel)</label>
                                    <input
                                        id="scheduleDate"
                                        type="datetime-local"
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2.5 text-white focus:border-blue-500 outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Laisser vide pour un envoi immédiat.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={async () => {
                                    const role = (document.getElementById('broadcastRole') as HTMLSelectElement).value;
                                    const title = (document.getElementById('broadcastTitle') as HTMLInputElement).value;
                                    const message = (document.getElementById('broadcastMessage') as HTMLTextAreaElement).value;
                                    const isVerified = (document.getElementById('filterVerified') as HTMLInputElement).checked;
                                    const scheduleDate = (document.getElementById('scheduleDate') as HTMLInputElement).value;

                                    if (!title || !message) return toast.warning('Veuillez remplir le titre et le message.');

                                    const filters = isVerified ? { isVerified: true } : undefined;
                                    const payload = { title, message, targetRole: role, filters };

                                    if (scheduleDate) {
                                        if (!window.confirm(`Confirmer la planification pour le ${new Date(scheduleDate).toLocaleString()} ?`)) return;
                                        try {
                                            await api.post('/admin/schedule', {
                                                action: 'BROADCAST',
                                                payload,
                                                executeAt: scheduleDate
                                            });
                                            toast.success('🚀 Broadcast programmé avec succès !');
                                        } catch (e) {
                                            toast.error('Erreur lors de la planification.');
                                        }
                                    } else {
                                        if (!window.confirm('Confirmer l\'envoi IMMÉDIAT à la cible sélectionnée ?')) return;
                                        try {
                                            await api.post('/admin/broadcast', payload);
                                            toast.success('✅ Broadcast envoyé avec succès !');
                                        } catch (e) {
                                            toast.error('Erreur lors de l\'envoi.');
                                        }
                                    }
                                }}
                                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transform active:scale-95 transition-all flex items-center gap-3"
                            >
                                <Bell className="w-5 h-5" />
                                CONFIRMER L'OPÉRATION
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'ads') {
            return (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-green-500" /> Gestion des Publicités
                    </h3>
                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <table className="w-full text-left text-gray-300">
                            <thead className="bg-gray-950 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Campagne</th>
                                    <th className="p-4">Annonceur</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Budget / Dépensé</th>
                                    <th className="p-4">Perf (Imp/Clics)</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-8">Chargement...</td></tr>
                                ) : ads.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-gray-500">Aucune publicité trouvée.</td></tr>
                                ) : ads.map((ad) => (
                                    <tr key={ad._id} className="hover:bg-gray-800 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-white">{ad.name}</div>
                                            <div className="text-xs text-gray-500">{ad.placements.join(', ')}</div>
                                        </td>
                                        <td className="p-4">{ad.advertiserId?.email || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${ad.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                ad.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {ad.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-white">{ad.budget.toLocaleString()} FCFA</div>
                                            <div className="text-xs text-gray-500">{ad.spent.toFixed(0)} dépensés</div>
                                        </td>
                                        <td className="p-4">
                                            <div>👁️ {ad.impressions}</div>
                                            <div className="text-blue-400">👆 {ad.clicks}</div>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {ad.status === 'draft' && (
                                                <button
                                                    onClick={() => handleAdReview(ad._id, 'APPROVE')}
                                                    className="bg-green-600/20 hover:bg-green-600/40 text-green-500 px-3 py-1 rounded text-sm border border-green-600/50"
                                                >
                                                    Valider
                                                </button>
                                            )}
                                            {ad.status === 'active' && (
                                                <button
                                                    onClick={() => handleAdReview(ad._id, 'STOP')}
                                                    className="bg-red-600/20 hover:bg-red-600/40 text-red-500 px-3 py-1 rounded text-sm border border-red-600/50"
                                                >
                                                    Stopper
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

        if (activeTab === 'coupons') {
            return (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Tag className="text-pink-500" /> Gestion des Codes Promo
                    </h3>

                    {/* Create New Coupon Form */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <h4 className="font-bold text-lg mb-4">Créer un nouveau coupon</h4>
                        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">Code</label>
                                <input
                                    type="text"
                                    id="code"
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white focus:border-pink-500 outline-none"
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="discountType" className="block text-sm font-medium text-gray-300 mb-1">Type de réduction</label>
                                <select
                                    id="discountType"
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white focus:border-pink-500 outline-none"
                                    value={newCoupon.discountType}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                                >
                                    <option value="PERCENTAGE">Pourcentage</option>
                                    <option value="FIXED">Montant Fixe</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Montant / Pourcentage</label>
                                <input
                                    type="number"
                                    id="amount"
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white focus:border-pink-500 outline-none"
                                    value={newCoupon.amount}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, amount: parseFloat(e.target.value) })}
                                    required
                                    min="0"
                                />
                            </div>
                            <div>
                                <label htmlFor="maxUses" className="block text-sm font-medium text-gray-300 mb-1">Utilisations Max (0 pour illimité)</label>
                                <input
                                    type="number"
                                    id="maxUses"
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white focus:border-pink-500 outline-none"
                                    value={newCoupon.maxUses}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: parseInt(e.target.value) })}
                                    min="0"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300 mb-1">Date d'expiration (Optionnel)</label>
                                <input
                                    type="datetime-local"
                                    id="expiryDate"
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-white focus:border-pink-500 outline-none"
                                    value={newCoupon.expiryDate}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Créer Coupon
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Coupons List */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <table className="w-full text-left text-gray-300">
                            <thead className="bg-gray-950 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="p-4">Code</th>
                                    <th className="p-4">Type / Montant</th>
                                    <th className="p-4">Utilisations</th>
                                    <th className="p-4">Expiration</th>
                                    <th className="p-4">Statut</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-8">Chargement...</td></tr>
                                ) : coupons.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-gray-500">Aucun coupon trouvé.</td></tr>
                                ) : coupons.map((coupon) => (
                                    <tr key={coupon._id} className="hover:bg-gray-800 transition-colors">
                                        <td className="p-4 font-bold text-white">{coupon.code}</td>
                                        <td className="p-4">
                                            {coupon.discountType === 'PERCENTAGE' ? `${coupon.amount}%` : `${coupon.amount} FCFA`}
                                        </td>
                                        <td className="p-4">{coupon.usedCount} / {coupon.maxUses || '∞'}</td>
                                        <td className="p-4">
                                            {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Jamais'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${coupon.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {coupon.isActive ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteCoupon(coupon._id)}
                                                className="bg-red-600/20 hover:bg-red-600/40 text-red-500 px-3 py-1 rounded text-sm border border-red-600/50"
                                            >
                                                Supprimer
                                            </button>
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
                            { id: 'kyc', icon: Shield, label: 'Vérifications (KYC)' },
                            { id: 'escrow', icon: DollarSign, label: 'Finances & Escrow' },
                            { id: 'logs', icon: Lock, label: 'Audit Logs' },
                            { id: 'ads', icon: TrendingUp, label: 'Publicités' },
                            { id: 'coupons', icon: Tag, label: 'Codes Promo' },
                        ].map((item) => {
                            const Icon = item.icon as any;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === item.id
                                        ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </button>
                            );
                        })}
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
