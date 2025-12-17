import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader, TrendingUp, Clock } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import api from '../api/client';
import {
    globalSearch,
    searchSuggestions,
    highlightText,
    getEntityIcon,
    getEntityColor,
    SearchResult,
    SearchEntityType,
} from '../utils/search';

export interface GlobalSearchProps {
    placeholder?: string;
    className?: string;
    onResultClick?: (result: SearchResult) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
    placeholder = 'Rechercher utilisateurs, emplois, services...',
    className = '',
    onResultClick,
}) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebounce(query, 300);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Perform search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.trim().length < 2) {
            setResults([]);
            setSuggestions([]);
            return;
        }

        performSearch(debouncedQuery);
    }, [debouncedQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = async (searchQuery: string) => {
        setIsLoading(true);

        try {
            // 1. Static Pages Search
            const staticPages = [
                { id: 'dashboard', title: 'Tableau de bord', description: 'Vue d\'ensemble', path: '/dashboard', type: 'page' },
                { id: 'jobs', title: 'Emplois', description: 'Trouver un job', path: '/jobs', type: 'page' },
                { id: 'services', title: 'Services', description: 'Trouver un prestataire', path: '/services', type: 'services' },
                { id: 'premium', title: 'JOM Premium', description: 'Abonnements & Boosts', path: '/premium', type: 'page' },
                { id: 'profile', title: 'Mon Profil', description: 'Gérer mon profil', path: '/profile/me', type: 'page' },
                { id: 'settings', title: 'Paramètres', description: 'Compte & Sécurité', path: '/settings', type: 'page' },
                { id: 'messages', title: 'Messages', description: 'Vos conversations', path: '/messages', type: 'page' },
                { id: 'formations', title: 'Formations', description: 'Apprendre', path: '/formations', type: 'formations' },
            ];

            const pageResults: SearchResult[] = staticPages
                .filter(p =>
                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(p => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    type: 'all',
                    metadata: { path: p.path, isPage: true }
                }));

            // 2. Call backend API
            const response = await api.get(`/search/global?q=${searchQuery}`);
            const data = response.data;

            // Transform backend format to frontend SearchResult format
            const backendResults: SearchResult[] = [];

            data.users?.forEach((u: any) => backendResults.push({
                id: u._id,
                title: `${u.firstName || ''} ${u.lastName || ''} ${u.name ? '(' + u.name + ')' : ''}`.trim(),
                description: u.title || 'Utilisateur',
                type: 'users',
                avatar: u.avatar
            }));

            data.jobs?.forEach((j: any) => backendResults.push({
                id: j._id,
                title: j.title,
                description: j.company?.name || 'Entreprise',
                type: 'jobs'
            }));

            data.services?.forEach((s: any) => backendResults.push({
                id: s._id,
                title: s.title,
                description: s.category || 'Service',
                type: 'services',
                image: s.images?.[0]
            }));

            data.trainings?.forEach((t: any) => backendResults.push({
                id: t._id,
                title: t.title,
                description: t.level || 'Formation',
                type: 'formations'
            }));

            setResults([...pageResults, ...backendResults]);
            setSuggestions([]);
            setIsOpen(true);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setSelectedIndex(-1);

        if (value.trim().length === 0) {
            setIsOpen(false);
            setResults([]);
            setSuggestions([]);
        } else {
            setIsOpen(true);
        }
    };

    const handleResultClick = (result: SearchResult) => {
        // Save to recent searches
        saveRecentSearch(query);

        // Close dropdown
        setIsOpen(false);
        setQuery('');

        // Handle Page Redirect
        if (result.metadata?.isPage) {
            navigate(result.metadata.path);
            return;
        }

        // Navigate based on type
        const routes: Record<SearchEntityType, string> = {
            users: `/profile/${result.id}`,
            jobs: `/jobs/${result.id}`,
            services: `/services/${result.id}`,
            formations: `/formations/${result.id}`,
            posts: `/posts/${result.id}`,
            all: '/',
        };

        if (onResultClick) {
            onResultClick(result);
        } else {
            navigate(routes[result.type] || '/');
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        inputRef.current?.focus();
    };

    const handleRecentSearchClick = (search: string) => {
        setQuery(search);
        inputRef.current?.focus();
    };

    const saveRecentSearch = (search: string) => {
        const trimmed = search.trim();
        if (!trimmed) return;

        const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        const totalItems = results.length + suggestions.length;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleResultClick(results[selectedIndex]);
                } else if (selectedIndex >= results.length && selectedIndex < totalItems) {
                    const suggestionIndex = selectedIndex - results.length;
                    handleSuggestionClick(suggestions[suggestionIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setSuggestions([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all"
                />
                {isLoading && (
                    <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 w-5 h-5 animate-spin" />
                )}
                {query && !isLoading && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* No query - show recent searches */}
                    {query.trim().length < 2 && recentSearches.length > 0 && (
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Recherches Récentes
                                </h3>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                                >
                                    Effacer
                                </button>
                            </div>
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleRecentSearchClick(search)}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-left transition-colors"
                                >
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{search}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="p-3">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                Résultats
                            </h3>
                            {results.map((result, index) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleResultClick(result)}
                                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${selectedIndex === index
                                        ? 'bg-primary-50 dark:bg-primary-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {/* Avatar/Image */}
                                    {result.avatar || result.image ? (
                                        <img
                                            src={result.avatar || result.image}
                                            alt={result.title}
                                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl">{getEntityIcon(result.type)}</span>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className="text-sm font-medium text-gray-900 dark:text-white truncate"
                                                dangerouslySetInnerHTML={{
                                                    __html: highlightText(result.title, query),
                                                }}
                                            />
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${getEntityColor(
                                                    result.type
                                                )}`}
                                            >
                                                {result.type}
                                            </span>
                                        </div>
                                        {result.description && (
                                            <p
                                                className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1"
                                                dangerouslySetInnerHTML={{
                                                    __html: highlightText(result.description, query),
                                                }}
                                            />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Suggestions
                            </h3>
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${selectedIndex === results.length + index
                                        ? 'bg-primary-50 dark:bg-primary-900/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Search className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {query.trim().length >= 2 && !isLoading && results.length === 0 && (
                        <div className="p-8 text-center">
                            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Aucun résultat pour "{query}"
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Essayez d'autres mots-clés
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
