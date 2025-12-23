
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
    Search, MapPin, Briefcase, GraduationCap, Building2, Heart,
    Users, UserPlus, MessageCircle, ArrowRight, Star, Plus, CheckCircle2,
    Globe, SlidersHorizontal, TrendingUp, Sparkles, Share2, MoreVertical,
    FileText, Lightbulb, BookOpen, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BackButton } from '../components/BackButton';


// Configuration des communautés par rôle
const COMMUNITIES_BY_ROLE = {
    individual: [
        { id: 1, name: 'Freelances & Indépendants', members: 'Communauté Active', icon: Users },
        { id: 2, name: 'Offres d\'emploi Tech', members: 'Opportunités', icon: Briefcase },
        { id: 3, name: 'Entraide & Conseils Carrière', members: 'Support', icon: Heart },
    ],
    company: [
        { id: 4, name: 'Business B2B Afrique', members: 'Réseau Pro', icon: Briefcase },
        { id: 5, name: 'Startups & Innovation', members: 'Écosystème', icon: Lightbulb },
        { id: 6, name: 'Appels d\'offres & Marchés', members: 'Opportunités', icon: FileText },
    ],
    etablissement: [
        { id: 7, name: 'Pédagogie & E-learning', members: 'Éducation', icon: BookOpen },
        { id: 8, name: 'Partenariats Écoles-Entreprises', members: 'Collaboration', icon: Users },
        { id: 9, name: 'Orientation Étudiants', members: 'Conseils', icon: GraduationCap },
    ],

    all: [
        { id: 13, name: 'Tech Afrique', members: 'Tech', icon: Globe },
        { id: 14, name: 'Entrepreneurs', members: 'Business', icon: Briefcase },
        { id: 15, name: 'Santé & Bien-être', members: 'Santé', icon: Heart },
        { id: 16, name: 'Éducation', members: 'Savoir', icon: GraduationCap },
    ]
};

// Configuration des filtres par rôle
const FILTER_OPTIONS = {
    locations: ['Dakar', 'Abidjan', 'Lomé', 'Bamako', 'Saint-Louis', 'International'],
    sectors: {
        individual: ['Informatique', 'Marketing', 'BTP', 'Droit', 'Santé', 'Design'],
        company: ['Informatique', 'Construction', 'Conseil', 'Commerce', 'Agro-industrie'],
        etablissement: ['Commerce', 'Informatique', 'Design', 'Gestion', 'Santé'],

    },
    availability: {
        individual: [
            { label: 'Tous', value: '' },
            { label: 'Open to Work', value: 'open' },
        ],
        company: [
            { label: 'Toutes', value: '' },
            { label: 'Recrute activement', value: 'hiring' },
        ]
    }
};

import api from '../api/client';
import { SocialPost } from '../types';

export const SocialNetwork: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'all' | UserRole>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Real Data State
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [recommendedProfiles, setRecommendedProfiles] = useState<any[]>([]);
    const [trendsProfiles, setTrendsProfiles] = useState<any[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    // Fetch Posts & Suggestions
    useEffect(() => {
        fetchPosts();
        fetchSuggestions();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            const rawPosts = response.data.data;

            const mappedPosts = rawPosts.map((p: any) => ({
                id: p._id,
                author: {
                    id: p.author?._id || 'unknown',
                    name: p.author ? `${p.author.firstName} ${p.author.lastName}` : 'Utilisateur Inconnu',
                    avatar: p.author?.avatar || `https://ui-avatars.com/api/?name=${p.author?.firstName}+${p.author?.lastName}`,
                    role: (p.author?.roles && p.author.roles[0]) ? p.author.roles[0].toLowerCase() : 'individual',
                    headline: p.author?.headline || 'Membre JOM'
                },
                type: p.type === 'job' ? 'job_offer' : (p.image ? 'media' : 'text'),
                content: p.content,
                timestamp: new Date(p.createdAt).toLocaleDateString(),
                likes: p.likes?.length || 0,
                comments: p.comments?.length || 0,
                shares: p.shares?.length || 0,
                isLiked: p.likes?.includes(user?._id),
                image: p.metadata?.images ? p.metadata.images[0] : (p.image || undefined),
                jobDetails: p.metadata?.jobDetails,
                serviceDetails: p.metadata?.serviceDetails,
                trainingDetails: p.metadata?.trainingDetails,
            }));

            setPosts(mappedPosts);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const response = await api.get('/profiles?limit=6');
            const profiles = response.data.data.map((p: any) => ({
                id: p.user?._id,
                name: `${p.firstName} ${p.lastName}`,
                avatar: p.avatarUrl || `https://ui-avatars.com/api/?name=${p.firstName}+${p.lastName}`,
                headline: p.bio?.substring(0, 30) || 'Membre JOM',
                isVerified: p.user?.isVerified
            }));

            // Split into Recommended and Trends
            setRecommendedProfiles(profiles.slice(0, 3));
            setTrendsProfiles(profiles.slice(3, 6));
        } catch (e) {
            console.error("Failed to fetch suggestions", e);
        }
    };

    // State pour les filtres avancés
    const [filters, setFilters] = useState({
        location: '',
        sector: '',
        status: ''
    });

    // Reset filters when tab changes
    useEffect(() => {
        setFilters({ location: '', sector: '', status: '' });
        setSearchQuery('');
    }, [activeTab]);

    // Helpers pour l'UI
    const getTabLabel = (type: string) => {
        switch (type) {
            case 'individual': return 'Particuliers';
            case 'company': return 'Entreprises';
            case 'etablissement': return 'Établissements';

            default: return 'Tous';
        }
    };

    const getTabIcon = (type: string) => {
        switch (type) {
            case 'individual': return Users;
            case 'company': return Building2;
            case 'etablissement': return GraduationCap;

            default: return Globe;
        }
    };

    const getSearchPlaceholder = () => {
        switch (activeTab) {
            case 'individual': return "Rechercher un talent, un métier...";
            case 'company': return "Rechercher une entreprise, un service...";
            case 'etablissement': return "Rechercher une école, une formation...";

            default: return "Rechercher par nom, métier, compétence, ville...";
        }
    };

    // État local pour les boutons "Suivre/Connecter"
    const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

    const handleConnect = (id: string) => {
        if (connectedUsers.includes(id)) {
            setConnectedUsers(prev => prev.filter(uid => uid !== id));
        } else {
            setConnectedUsers(prev => [...prev, id]);
        }
    };

    const currentCommunities = COMMUNITIES_BY_ROLE[activeTab as keyof typeof COMMUNITIES_BY_ROLE] || COMMUNITIES_BY_ROLE['all'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* HEADER AREA */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <BackButton className="mb-0" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Réseau Professionnel</h1>
                                <p className="text-gray-500 dark:text-gray-400">Explorez, connectez et grandissez avec la communauté JOM.</p>
                            </div>
                        </div>
                    </div>

                    {/* SEARCH & FILTERS BAR */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={getSearchPlaceholder()}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${showFilters ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                            <SlidersHorizontal className="w-5 h-5" /> Filtres
                        </button>
                    </div>

                    {/* DYNAMIC EXPANDABLE FILTERS */}
                    {showFilters && (
                        <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                                    Affiner pour : <span className="text-primary-600 dark:text-primary-400">{getTabLabel(activeTab)}</span>
                                </h3>
                                <button
                                    onClick={() => setFilters({ location: '', sector: '', status: '' })}
                                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" /> Réinitialiser
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Filtre Localisation (Commun à tous) */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Localisation</label>
                                    <select
                                        value={filters.location}
                                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none text-gray-700 dark:text-gray-200"
                                    >
                                        <option value="">Toutes les zones</option>
                                        {FILTER_OPTIONS.locations.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtre Secteur/Compétence (Dynamique) */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                                        {activeTab === 'individual' ? 'Compétences / Métier' : activeTab === 'etablissement' ? 'Domaine enseignement' : 'Secteur d\'activité'}
                                    </label>
                                    <select
                                        value={filters.sector}
                                        onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none text-gray-700 dark:text-gray-200"
                                    >
                                        <option value="">Tout sélectionner</option>
                                        {(activeTab === 'all'
                                            ? [...new Set(Object.values(FILTER_OPTIONS.sectors).flat())]
                                            : FILTER_OPTIONS.sectors[activeTab as keyof typeof FILTER_OPTIONS.sectors] || []
                                        ).map(sector => (
                                            <option key={sector} value={sector}>{sector}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtre Statut (Specifique Particulier & Entreprise) */}
                                {activeTab === 'individual' && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Disponibilité</label>
                                        <select
                                            value={filters.status}
                                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none text-gray-700 dark:text-gray-200"
                                        >
                                            {FILTER_OPTIONS.availability.individual.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {(activeTab === 'company' || activeTab === 'all') && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Opportunités</label>
                                        <select
                                            value={filters.status}
                                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none text-gray-700 dark:text-gray-200"
                                        >
                                            {FILTER_OPTIONS.availability.company.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* TABS NAVIGATION */}
                <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide">
                    {['all', 'individual', 'company', 'etablissement'].map((tab) => {
                        const isActive = activeTab === tab;
                        const Icon = getTabIcon(tab);
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${isActive
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {getTabLabel(tab)}
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* MAIN CONTENT: NETWORK LIST */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Recommended Section (Real API Data) */}
                        {activeTab === 'all' && !searchQuery && recommendedProfiles.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-yellow-500" /> Recommandé pour vous
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {recommendedProfiles.map(profile => (
                                        <div key={profile.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex items-start justify-between mb-3">
                                                <img src={profile.avatar} alt={profile.name} className="w-12 h-12 rounded-lg object-cover" />
                                                {profile.isVerified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                                            </div>
                                            <Link to={`/profile/${profile.id}`}>
                                                <h3 className="font-bold text-gray-900 dark:text-white truncate hover:underline">{profile.name}</h3>
                                            </Link>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">{profile.headline}</p>
                                            <button
                                                onClick={() => handleConnect(profile.id)}
                                                className={`w-full py-1.5 rounded-lg border text-xs font-bold transition-colors ${connectedUsers.includes(profile.id)
                                                    ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-800'
                                                    : 'border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                                    }`}
                                            >
                                                {connectedUsers.includes(profile.id) ? 'Suivi' : 'Suivre'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* RESULTS GRID */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Fil d'actualité ({posts.length})
                                </h2>
                            </div>

                            {/* POSTS FEED */}
                            <div className="space-y-6">
                                {loadingPosts ? (
                                    <div className="text-center py-10">Chargement...</div>
                                ) : posts.map((post) => (
                                    <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                                        {/* Author Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <Link to={`/profile/${post.author.id}`}>
                                                <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
                                            </Link>
                                            <div>
                                                <Link to={`/profile/${post.author.id}`} className="hover:underline">
                                                    <h3 className="font-bold text-gray-900 dark:text-white">{post.author.name}</h3>
                                                </Link>
                                                <p className="text-xs text-gray-500">{post.author.headline} • {post.timestamp}</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="mb-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                            {post.content}
                                        </div>

                                        {/* Image if available */}
                                        {post.image && (
                                            <div className="mb-4 rounded-xl overflow-hidden">
                                                <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
                                            </div>
                                        )}

                                        {/* Footer Actions */}
                                        <div className="flex items-center gap-6 text-gray-500 text-sm">
                                            <button className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                                                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} /> {post.likes}
                                            </button>
                                            <button className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                                                <MessageCircle className="w-5 h-5" /> {post.comments}
                                            </button>
                                            <button className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                                                <Share2 className="w-5 h-5" /> {post.shares}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR: TRENDS & COMMUNITIES */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Trends (Now connected to real API) */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-500" /> Suggestions
                            </h3>
                            <div className="space-y-6">
                                {trendsProfiles.map(p => (
                                    <div key={p.id} className="flex items-center gap-3">
                                        <img src={p.avatar} className="w-10 h-10 rounded-lg" alt={p.name} />
                                        <div className="flex-1 overflow-hidden">
                                            <Link to={`/profile/${p.id}`} className="hover:underline">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.name}</h4>
                                            </Link>
                                            <p className="text-xs text-gray-500 truncate">{p.headline}</p>
                                        </div>
                                        <button className="text-primary-600 text-xs font-bold hover:underline" onClick={() => handleConnect(p.id)}>
                                            {connectedUsers.includes(p.id) ? 'Suivi' : 'Suivre'}
                                        </button>
                                    </div>
                                ))}
                                {trendsProfiles.length === 0 && <p className="text-xs text-gray-500">Aucune suggestion pour le moment.</p>}
                            </div>
                        </div>

                        {/* Communities */}
                        <div className="bg-gradient-to-br from-primary-900 to-primary-800 rounded-2xl p-6 shadow-lg text-white">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5" /> Communautés
                            </h3>
                            <div className="space-y-4">
                                {currentCommunities.map(comm => (
                                    <div key={comm.id} className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer border border-white/10 group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/10 rounded-lg text-white">
                                                <comm.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">{comm.name}</h4>
                                                <p className="text-xs text-primary-200">{comm.members} membres</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-primary-300 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-3 bg-white text-primary-900 font-bold rounded-xl text-sm hover:bg-primary-50 transition-colors">
                                Découvrir toutes les communautés
                            </button>
                        </div>

                        {/* Premium Teaser */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-700/30 text-center">
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="w-6 h-6 fill-current" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Développez votre réseau</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Les membres Premium ont 4x plus de visibilité et de connexions.</p>
                            <Link to="/premium" className="inline-block px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg text-sm transition-colors">
                                Passer Premium
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialNetwork;

