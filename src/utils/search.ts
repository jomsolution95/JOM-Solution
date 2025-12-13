import api from '../api/client';

export type SearchEntityType = 'users' | 'jobs' | 'services' | 'formations' | 'posts' | 'all';

export interface SearchResult {
    id: string;
    type: SearchEntityType;
    title: string;
    description?: string;
    avatar?: string;
    image?: string;
    metadata?: Record<string, any>;
    score?: number;
}

export interface SearchResponse {
    results: SearchResult[];
    total: number;
    query: string;
    took?: number; // Time in ms
}

/**
 * Global search across all entities
 */
export const globalSearch = async (
    query: string,
    options: {
        type?: SearchEntityType;
        limit?: number;
        offset?: number;
    } = {}
): Promise<SearchResponse> => {
    const { type = 'all', limit = 10, offset = 0 } = options;

    try {
        const response = await api.get('/search', {
            params: {
                q: query,
                type,
                limit,
                offset,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Search failed:', error);
        throw error;
    }
};

/**
 * Search suggestions (autocomplete)
 */
export const searchSuggestions = async (
    query: string,
    limit: number = 5
): Promise<string[]> => {
    try {
        const response = await api.get('/search/suggestions', {
            params: { q: query, limit },
        });

        return response.data.suggestions || [];
    } catch (error) {
        console.error('Suggestions failed:', error);
        return [];
    }
};

/**
 * Search specific entity type
 */
export const searchUsers = async (query: string, limit: number = 10) => {
    return globalSearch(query, { type: 'users', limit });
};

export const searchJobs = async (query: string, limit: number = 10) => {
    return globalSearch(query, { type: 'jobs', limit });
};

export const searchServices = async (query: string, limit: number = 10) => {
    return globalSearch(query, { type: 'services', limit });
};

export const searchFormations = async (query: string, limit: number = 10) => {
    return globalSearch(query, { type: 'formations', limit });
};

export const searchPosts = async (query: string, limit: number = 10) => {
    return globalSearch(query, { type: 'posts', limit });
};

/**
 * Highlight keywords in text
 */
export const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;

    const keywords = query.trim().split(/\s+/);
    let highlightedText = text;

    keywords.forEach(keyword => {
        const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
        highlightedText = highlightedText.replace(
            regex,
            '<mark class="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-white">$1</mark>'
        );
    });

    return highlightedText;
};

/**
 * Escape special regex characters
 */
const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Get entity icon based on type
 */
export const getEntityIcon = (type: SearchEntityType): string => {
    const icons = {
        users: '👤',
        jobs: '💼',
        services: '🛠️',
        formations: '🎓',
        posts: '📝',
        all: '🔍',
    };

    return icons[type] || '📄';
};

/**
 * Get entity color based on type
 */
export const getEntityColor = (type: SearchEntityType): string => {
    const colors = {
        users: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        jobs: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        services: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        formations: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        posts: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        all: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };

    return colors[type] || colors.all;
};

/**
 * Format search result for display
 */
export const formatSearchResult = (result: SearchResult): string => {
    const { type, title, description } = result;
    const icon = getEntityIcon(type);

    return `${icon} ${title}${description ? ` - ${description.substring(0, 50)}...` : ''}`;
};
