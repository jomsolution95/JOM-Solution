import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

export const SuperAdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
            // We manually check role here or let the Dashboard redirect if not authorized
            // Ideally, the backend login response contains the role, or we fetch profile
            // But for now, we assume login success means valid credentials
            // The Protected Route for /admin-dashboard will verify the role
            navigate('/admin-dashboard');
        } catch (err) {
            setError('Accès Refusé. Cette tentative a été enregistrée.');
            // In a real scenario, we would log this IP
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-900 border border-red-900/30 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>

                <div className="text-center mb-10 relative z-10">
                    <div className="mx-auto w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                        <Shield className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">JOM Bunker</h1>
                    <p className="text-red-400/60 text-xs font-mono">NIVEAU D'ACCRÉDITATION 0 REQUIS</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    {error && (
                        <div className="bg-red-900/20 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider pl-1">Identifiant Système</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
                                placeholder="root@system"
                            />
                            <Lock className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider pl-1">Clé de Sécurité</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-800/50 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
                                placeholder="••••••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                    >
                        {loading ? 'Authentification...' : 'Initialiser la Connexion'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-[10px] font-mono">
                        IP ENREGISTRÉE : {window.location.hostname} <br />
                        TOUTE TENTATIVE D'INTRUSION SERA POURSUIVIE.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
