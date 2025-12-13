# Global Search System Documentation

## Overview

Comprehensive global search system with Elasticsearch/Algolia integration, live suggestions, keyword highlighting, and debounced queries.

## Features Implemented ✅

### 1. **Search Utilities** (`src/utils/search.ts`)

Core search functions:
- ✅ `globalSearch()` - Search across all entities
- ✅ `searchSuggestions()` - Autocomplete suggestions
- ✅ `searchUsers/Jobs/Services/Formations/Posts()` - Entity-specific search
- ✅ `highlightText()` - Keyword highlighting with `<mark>` tags
- ✅ `getEntityIcon()` - Icon for each entity type
- ✅ `getEntityColor()` - Color coding for entity types

### 2. **GlobalSearch Component** (`src/components/GlobalSearch.tsx`)

Full-featured search component:
- ✅ **Debouncing**: 300ms delay to reduce API calls
- ✅ **Live Suggestions**: Real-time autocomplete
- ✅ **Keyword Highlighting**: Highlights matching terms
- ✅ **Recent Searches**: Saves last 5 searches
- ✅ **Keyboard Navigation**: Arrow keys + Enter
- ✅ **Multi-Entity Search**: Users, jobs, services, formations, posts
- ✅ **Loading States**: Spinner during search
- ✅ **Empty States**: No results message
- ✅ **Click Outside**: Closes dropdown
- ✅ **Responsive**: Works on mobile and desktop

## Installation

```bash
npm install use-debounce
```

**Status**: ✅ Installed

## Usage Examples

### 1. Basic Usage

```typescript
import { GlobalSearch } from '../components/GlobalSearch';

function Navbar() {
  return (
    <nav>
      <GlobalSearch placeholder="Search anything..." />
    </nav>
  );
}
```

### 2. With Custom Handler

```typescript
import { GlobalSearch } from '../components/GlobalSearch';
import { SearchResult } from '../utils/search';

function MyPage() {
  const handleResultClick = (result: SearchResult) => {
    console.log('Selected:', result);
    // Custom logic
    if (result.type === 'users') {
      openUserModal(result.id);
    }
  };

  return (
    <GlobalSearch
      onResultClick={handleResultClick}
      placeholder="Find users, jobs, services..."
    />
  );
}
```

### 3. Standalone Search Page

```typescript
import { useState } from 'react';
import { globalSearch, SearchResult } from '../utils/search';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async (q: string) => {
    const response = await globalSearch(q, { limit: 20 });
    setResults(response.results);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          handleSearch(e.target.value);
        }}
      />
      {results.map(result => (
        <SearchResultCard key={result.id} result={result} />
      ))}
    </div>
  );
}
```

### 4. Entity-Specific Search

```typescript
import { searchJobs, searchUsers } from '../utils/search';

// Search only jobs
const jobResults = await searchJobs('developer', 10);

// Search only users
const userResults = await searchUsers('john', 10);
```

## Component Props

### GlobalSearch

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `'Search users, jobs...'` | Input placeholder |
| `className` | `string` | `''` | Additional CSS classes |
| `onResultClick` | `(result: SearchResult) => void` | - | Custom result handler |

## Search API

### Request

```typescript
GET /api/search?q=developer&type=all&limit=10&offset=0
```

**Parameters**:
- `q` (required): Search query
- `type` (optional): Entity type filter (`all`, `users`, `jobs`, `services`, `formations`, `posts`)
- `limit` (optional): Results per page (default: 10)
- `offset` (optional): Pagination offset (default: 0)

### Response

```typescript
{
  results: [
    {
      id: "123",
      type: "jobs",
      title: "Senior Developer",
      description: "Full-time position...",
      avatar: "https://...",
      image: "https://...",
      metadata: {
        company: "Tech Corp",
        location: "Remote"
      },
      score: 0.95
    }
  ],
  total: 42,
  query: "developer",
  took: 15 // milliseconds
}
```

## Features in Detail

### 1. Debouncing (300ms)

Reduces API calls by waiting 300ms after user stops typing:

```typescript
const [debouncedQuery] = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery.length >= 2) {
    performSearch(debouncedQuery);
  }
}, [debouncedQuery]);
```

### 2. Keyword Highlighting

Highlights matching keywords in results:

```typescript
// Input: "Senior Developer", query: "dev"
// Output: "Senior <mark>Dev</mark>eloper"

const highlighted = highlightText(text, query);
```

### 3. Live Suggestions

Shows autocomplete suggestions as you type:

```typescript
const suggestions = await searchSuggestions(query, 5);
// Returns: ["developer jobs", "development", "developer remote"]
```

### 4. Recent Searches

Saves last 5 searches in localStorage:

```typescript
// Saved automatically on result click
localStorage.setItem('recentSearches', JSON.stringify(searches));

// Displayed when search is empty
{recentSearches.map(search => (
  <button onClick={() => setQuery(search)}>
    {search}
  </button>
))}
```

### 5. Keyboard Navigation

- **Arrow Down**: Move to next result
- **Arrow Up**: Move to previous result
- **Enter**: Select highlighted result
- **Escape**: Close dropdown

### 6. Entity Type Indicators

Each result shows its type with icon and color:

```typescript
// Icons
users: 👤
jobs: 💼
services: 🛠️
formations: 🎓
posts: 📝

// Colors
users: Blue
jobs: Green
services: Purple
formations: Orange
posts: Pink
```

## Backend Integration

### Elasticsearch Example

```typescript
// Backend (NestJS)
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class SearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL,
    });
  }

  async search(query: string, type: string, limit: number) {
    const indices = type === 'all' 
      ? ['users', 'jobs', 'services', 'formations', 'posts']
      : [type];

    const result = await this.client.search({
      index: indices,
      body: {
        query: {
          multi_match: {
            query,
            fields: ['title^3', 'description^2', 'tags'],
            fuzziness: 'AUTO',
          },
        },
        highlight: {
          fields: {
            title: {},
            description: {},
          },
        },
        size: limit,
      },
    });

    return {
      results: result.hits.hits.map(hit => ({
        id: hit._id,
        type: hit._index,
        title: hit._source.title,
        description: hit._source.description,
        score: hit._score,
      })),
      total: result.hits.total.value,
      took: result.took,
    };
  }
}
```

### Algolia Example

```typescript
// Backend
import algoliasearch from 'algoliasearch';

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);

async search(query: string, type: string) {
  const indices = type === 'all'
    ? ['users', 'jobs', 'services', 'formations', 'posts']
    : [type];

  const searches = indices.map(index => ({
    indexName: index,
    query,
    params: {
      hitsPerPage: 10,
      attributesToHighlight: ['title', 'description'],
    },
  }));

  const results = await client.multipleQueries(searches);

  return {
    results: results.results.flatMap(result =>
      result.hits.map(hit => ({
        id: hit.objectID,
        type: result.index,
        title: hit.title,
        description: hit.description,
        score: hit._rankingInfo?.nbTypos,
      }))
    ),
    total: results.results.reduce((sum, r) => sum + r.nbHits, 0),
  };
}
```

## Styling

The component uses Tailwind CSS with dark mode support:

```typescript
// Highlighted text
<mark class="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-white">
  keyword
</mark>

// Entity badges
<span class="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
  users
</span>
```

## Performance Optimization

### 1. Debouncing

Reduces API calls by 90%:

```typescript
// Without debounce: 10 API calls for "developer"
// With 300ms debounce: 1 API call
```

### 2. Request Cancellation

Cancel previous requests when new query comes:

```typescript
const abortController = new AbortController();

api.get('/search', {
  signal: abortController.signal,
});

// Cancel on new query
abortController.abort();
```

### 3. Caching

Cache results for repeated queries:

```typescript
const cache = new Map();

if (cache.has(query)) {
  return cache.get(query);
}

const results = await globalSearch(query);
cache.set(query, results);
```

### 4. Lazy Loading

Load results as user scrolls:

```typescript
const [offset, setOffset] = useState(0);

const loadMore = async () => {
  const more = await globalSearch(query, { offset });
  setResults(prev => [...prev, ...more.results]);
  setOffset(prev => prev + 10);
};
```

## Best Practices

1. **Minimum Query Length**: Require at least 2 characters
2. **Debounce**: Use 300ms delay
3. **Limit Results**: Show 8-10 results in dropdown
4. **Keyboard Support**: Implement arrow navigation
5. **Loading States**: Show spinner during search
6. **Error Handling**: Gracefully handle API failures
7. **Recent Searches**: Save user's search history
8. **Highlight Keywords**: Make matches obvious
9. **Entity Icons**: Visual differentiation
10. **Mobile Friendly**: Responsive design

## Troubleshooting

### No Results

- Check backend endpoint is correct
- Verify Elasticsearch/Algolia is running
- Check query minimum length (2 chars)
- Verify indices exist

### Slow Search

- Reduce debounce time (but increases API calls)
- Optimize backend queries
- Add caching layer
- Use CDN for static assets

### Highlighting Not Working

- Check `highlightText()` function
- Verify `dangerouslySetInnerHTML` is used
- Check CSS for `<mark>` tag

### Dropdown Not Closing

- Verify click outside handler
- Check `searchRef` is attached
- Ensure `setIsOpen(false)` is called

## Future Enhancements

- [ ] Voice search
- [ ] Search filters (date, location, price)
- [ ] Search analytics
- [ ] Typo tolerance
- [ ] Synonym support
- [ ] Search history sync across devices
- [ ] Advanced query syntax
- [ ] Search result preview
- [ ] Infinite scroll
- [ ] Search shortcuts (Cmd+K)

## Resources

- Search Utils: `src/utils/search.ts`
- GlobalSearch Component: `src/components/GlobalSearch.tsx`
- [Elasticsearch Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Algolia Docs](https://www.algolia.com/doc/)
- [use-debounce](https://www.npmjs.com/package/use-debounce)
