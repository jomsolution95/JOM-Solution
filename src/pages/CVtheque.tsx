import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, MapPin, Briefcase, GraduationCap, Star,
    Download, Heart, FileText, AlertCircle, Crown, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';
import { BackButton } from '../components/BackButton';

interface Profile {
    id: string;
    name: string;
    title: string;
    location: string;
    experience: number;
    skills: string[];
    education: string;
    availability: string;
    avatar?: string;
    isFavorite?: boolean;
}

interface QuotaInfo {
    used: number;
    limit: number;
    remaining: number;
}

export const CVtheque: React.FC = () => {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [quota, setQuota] = useState<QuotaInfo>({ used: 0, limit: 50, remaining: 50 });
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notes, setNotes] = useState('');

    // Search filters
    const [filters, setFilters] = useState({
        skills: '',
        city: '',
        minExperience: '',
        maxExperience: '',
        education: '',
        availability: '',
    });

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        setLoading(true);
        try {
            const response = await api.get('/cvtheque/search', { params: filters });
            setProfiles(response.data.profiles);
            setQuota({
                used: response.data.quotaUsed,
                limit: response.data.quotaLimit,
                remaining: response.data.quotaLimit - response.data.quotaUsed,
            });
        } catch (error: any) {
            if (error.response?.status === 403) {
                if (error.response.data.message?.includes('quota')) {
                    setShowQuotaModal(true);
                } else {
                    toast.error('Accès CVthèque réservé aux abonnés Company Biz');
                    navigate('/premium/checkout');
                }
            } else {
                toast.error('Erreur lors du chargement des profils');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = async (profileId: string) => {
        if (quota.remaining <= 0) {
            setShowQuotaModal(true);
            return;
        }

        try {
            await api.post(`/cvtheque/view/${profileId}`);
            setQuota(prev => ({
                ...prev,
                used: prev.used + 1,
                remaining: prev.remaining - 1,
            }));
            navigate(`/profile/${profileId}`);
        } catch (error: any) {
            if (error.response?.data.message?.includes('quota')) {
                setShowQuotaModal(true);
            } else {
                toast.error('Erreur lors de l\'accès au profil');
            }
        }
    };

    const handleToggleFavorite = async (profile: Profile) => {
        try {
            if (profile.isFavorite) {
                await api.delete(`/cvtheque/favorites/${profile.id}`);
                toast.success('Retiré des favoris');
            } else {
                await api.post('/cvtheque/favorites', { profileId: profile.id });
                toast.success('Ajouté aux favoris');
            }
            loadProfiles();
        } catch (error) {
            toast.error('Erreur lors de la mise à jour des favoris');
        }
    };

    const handleAddNotes = (profile: Profile) => {
        setSelectedProfile(profile);
        setShowNotesModal(true);
    };

    const handleSaveNotes = async () => {
        if (!selectedProfile) return;

        try {
            await api.post(`/cvtheque/favorites/${selectedProfile.id}/notes`, { notes });
            toast.success('Notes enregistrées');
            setShowNotesModal(false);
            setNotes('');
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement des notes');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton label="Retour" />

                {/* Header */}
                <div className="mt-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Briefcase className="w-8 h-8 text-primary-600" />
                                CVthèque Premium
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Accédez à notre base de talents qualifiés
                            </p>
                        </div>

                        {/* Quota Counter */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Consultations restantes</p>
                                <div className="flex items-center gap-2">
                                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                        {quota.remaining}
                                    </div>
                                    <div className="text-sm text-gray-500">/ {quota.limit}</div>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all"
                                        style={{ width: `${(quota.remaining / quota.limit) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Compétences
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="React, Python, Design..."
                                    value={filters.skills}
                                    onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Ville
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Dakar, Thiès..."
                                    value={filters.city}
                                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Expérience (années)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minExperience}
                                    onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })}
                                    className="w-1/2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxExperience}
                                    onChange={(e) => setFilters({ ...filters, maxExperience: e.target.value })}
                                    className="w-1/2 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Formation
                            </label>
                            <select
                                value={filters.education}
                                onChange={(e) => setFilters({ ...filters, education: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Tous niveaux</option>
                                <option value="Bac">Bac</option>
                                <option value="Bac+2">Bac+2</option>
                                <option value="Bac+3">Bac+3 (Licence)</option>
                                <option value="Bac+5">Bac+5 (Master)</option>
                                <option value="Doctorat">Doctorat</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Disponibilité
                            </label>
                            <select
                                value={filters.availability}
                                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">Toutes</option>
                                <option value="immediate">Immédiate</option>
                                <option value="1-month">Sous 1 mois</option>
                                <option value="3-months">Sous 3 mois</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={loadProfiles}
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Search className="w-5 h-5" />
                                {loading ? 'Recherche...' : 'Rechercher'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profiles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles.map((profile) => (
                        <div
                            key={profile.id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
                        >
                            <div className="p-6">
                                {/* Avatar & Name */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xl font-bold">
                                            {profile.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{profile.name}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.title}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleFavorite(profile)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <Heart
                                            className={`w-5 h-5 ${profile.isFavorite
                                                    ? 'fill-red-500 text-red-500'
                                                    : 'text-gray-400'
                                                }`}
                                        />
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-4 h-4" />
                                        {profile.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Briefcase className="w-4 h-4" />
                                        {profile.experience} ans d'expérience
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <GraduationCap className="w-4 h-4" />
                                        {profile.education}
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {profile.skills.slice(0, 3).map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {profile.skills.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                            +{profile.skills.length - 3}
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewProfile(profile.id)}
                                        className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm"
                                    >
                                        Voir le profil
                                    </button>
                                    <button
                                        onClick={() => handleAddNotes(profile)}
                                        className="p-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {!loading && profiles.length === 0 && (
                    <div className="text-center py-20">
                        <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Aucun profil trouvé
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Essayez de modifier vos critères de recherche
                        </p>
                    </div>
                )}

                {/* Quota Exceeded Modal */}
                {showQuotaModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Quota épuisé
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Vous avez atteint votre limite de {quota.limit} consultations pour ce mois.
                                    Votre quota se renouvellera le 1er du mois prochain.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowQuotaModal(false)}
                                        className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Fermer
                                    </button>
                                    <button
                                        onClick={() => navigate('/premium/checkout')}
                                        className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Crown className="w-5 h-5" />
                                        Augmenter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes Modal */}
                {showNotesModal && selectedProfile && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Notes internes
                                </h3>
                                <button
                                    onClick={() => setShowNotesModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {selectedProfile.name}
                            </p>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ajoutez vos notes sur ce candidat..."
                                rows={6}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setShowNotesModal(false)}
                                    className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveNotes}
                                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CVtheque;
