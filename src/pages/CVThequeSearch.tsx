import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Filter, Lock, Eye, Star, User } from 'lucide-react';
import api from '../api/client';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const CVThequeSearch = () => {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        query: '',
        location: '',
        skills: '',
        experienceMin: '',
        experienceMax: ''
    });

    const searchProfiles = async () => {
        setLoading(true);
        try {
            // Build query string
            const params = new URLSearchParams();
            if (filters.query) params.append('query', filters.query);
            if (filters.location) params.append('location', filters.location);
            if (filters.skills) params.append('skills', filters.skills); // Comma separated? Backend usually expects array or string

            const { data } = await api.get(`/cvtheque/search?${params.toString()}`);
            setProfiles(data.items || []);
            setTotal(data.total || 0);
        } catch (error: any) {
            console.error("CVTheque search error", error);
            if (error.response?.status === 403) {
                toast.error("Accès refusé. Veuillez passer à un compte Entreprise Premium.");
            } else {
                toast.error("Erreur lors de la recherche.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        searchProfiles();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchProfiles();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">CVthèque</h1>
                        <p className="text-gray-500 dark:text-gray-400">Trouvez les meilleurs talents pour votre entreprise.</p>
                    </div>
                    {/* Stats or Premium Badge could go here */}
                </div>

                {/* Search Bar */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                name="query"
                                placeholder="Mots-clés (ex: Développeur, Commercial)"
                                value={filters.query}
                                onChange={handleFilterChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                name="location"
                                placeholder="Ville ou Région"
                                value={filters.location}
                                onChange={handleFilterChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Star className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                name="skills"
                                placeholder="Compétences (ex: React, Node)"
                                value={filters.skills}
                                onChange={handleFilterChange}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                            />
                        </div>
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2">
                            <Search className="w-5 h-5" /> Rechercher
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{total} Talents trouvés</h2>

                    {loading ? (
                        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
                    ) : profiles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {profiles.map((profile) => (
                                <div key={profile._id} className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.displayName || 'User'}`}
                                            alt="Avatar"
                                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg">{profile.displayName || 'Utilisateur Anonyme'}</h3>
                                            <p className="text-primary-600 dark:text-primary-400 font-medium text-sm truncate">{profile.title || profile.bio?.substring(0, 30) || 'Membre JOM'}</p>
                                            <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                                                <MapPin className="w-3 h-3" /> {profile.location || 'Non renseigné'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {profile.skills?.slice(0, 3).map((skill: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs font-semibold">
                                                {skill}
                                            </span>
                                        ))}
                                        {profile.skills?.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-50 text-gray-400 rounded-md text-xs">+ {profile.skills.length - 3}</span>
                                        )}
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <Link to={`/profile/${profile.user || profile._id}`} className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-2 rounded-lg text-sm text-center transition-colors">
                                            Voir Profil
                                        </Link>
                                        <button className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                                            <Star className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300">
                            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Aucun profil ne correspond à vos critères.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CVThequeSearch;
