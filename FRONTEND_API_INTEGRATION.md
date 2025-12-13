# Frontend API Integration Guide

## Overview

This guide explains how to connect all frontend pages to the backend APIs using React Query for data fetching, caching, and state management.

## Setup Complete ✅

The following has been configured:

1. **React Query** - Installed and configured with QueryClient
2. **Toast Notifications** - react-toastify for user feedback
3. **API Client** - Axios with interceptors for auth and error handling
4. **API Services** - Typed service functions for all endpoints
5. **Custom Hooks** - React Query hooks for all API operations

## File Structure

```
src/
├── api/
│   ├── client.ts          # Axios instance with interceptors
│   ├── auth.ts            # Auth helpers (login, logout, refresh)
│   ├── errorHandler.ts    # Unified error handling
│   ├── services.ts        # API service functions
│   ├── index.ts           # Main exports
│   └── README.md          # API usage documentation
├── hooks/
│   └── useApi.ts          # React Query hooks for all endpoints
└── pages/
    ├── Jobs.tsx           # Example: Connected to backend
    ├── Services.tsx       # Example: Connected to backend
    ├── Dashboard.tsx      # Example: Connected to backend
    └── ... (other pages)
```

## Quick Start

### 1. Environment Setup

Create `.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

### 2. Using API Hooks in Pages

#### Example: Jobs Page

```typescript
import { useJobs, useCreateJob, useDeleteJob } from '../hooks/useApi';

export const Jobs: React.FC = () => {
  // Fetch jobs with automatic caching and revalidation
  const { data, isLoading, error } = useJobs({ page: 1, limit: 10 });
  
  // Mutations
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  const jobs = data?.data || [];

  const handleCreate = async (jobData) => {
    await createJob.mutateAsync(jobData);
    // Query automatically refetches after success
  };

  const handleDelete = async (id) => {
    await deleteJob.mutateAsync(id);
  };

  return (
    <div>
      {jobs.map(job => (
        <JobCard key={job.id} job={job} onDelete={handleDelete} />
      ))}
    </div>
  );
};
```

## Page-by-Page Migration Guide

### Jobs Page

**Before (Mock Data):**
```typescript
const mockJobs = [...];
const [jobs, setJobs] = useState(mockJobs);
```

**After (Real API):**
```typescript
import { useJobs, useCreateJob } from '../hooks/useApi';

const { data, isLoading, error } = useJobs();
const createJob = useCreateJob();

const jobs = data?.data || [];
```

### Services Page

**Replace:**
```typescript
const mockServices = [...];
```

**With:**
```typescript
import { useServices, useCreateService } from '../hooks/useApi';

const { data, isLoading } = useServices();
const services = data?.data || [];
```

### Profiles Page

**Replace:**
```typescript
const mockProfiles = [...];
```

**With:**
```typescript
import { useProfiles } from '../hooks/useApi';

const { data, isLoading } = useProfiles({ role: 'freelancer' });
const profiles = data?.data || [];
```

### Dashboard Page

**Fetch multiple resources:**
```typescript
import { useJobs, useOrders, useCurrentUser } from '../hooks/useApi';

const { data: user } = useCurrentUser();
const { data: jobs } = useJobs({ limit: 5 });
const { data: orders } = useOrders({ limit: 5 });
```

### Messages Page

**Real-time messaging:**
```typescript
import { useConversations, useMessages, useSendMessage } from '../hooks/useApi';

const { data: conversations } = useConversations();
const { data: messages } = useMessages(selectedConversationId);
const sendMessage = useSendMessage();

const handleSend = async (content: string) => {
  await sendMessage.mutateAsync({
    conversationId: selectedConversationId,
    content,
  });
};
```

## Common Patterns

### Loading States

```typescript
const { data, isLoading, error } = useJobs();

if (isLoading) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}
```

### Error Handling

```typescript
if (error) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">Failed to load data. Please try again.</p>
    </div>
  );
}
```

### Empty States

```typescript
const jobs = data?.data || [];

if (jobs.length === 0) {
  return (
    <div className="text-center py-12">
      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">No jobs found</p>
    </div>
  );
}
```

### Pagination

```typescript
const [page, setPage] = useState(1);
const { data } = useJobs({ page, limit: 10 });

const totalPages = Math.ceil((data?.total || 0) / 10);

<Pagination 
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

### Search & Filters

```typescript
const [searchTerm, setSearchTerm] = useState('');
const [status, setStatus] = useState('all');

const { data } = useJobs({ 
  search: searchTerm,
  status: status !== 'all' ? status : undefined,
});
```

### Optimistic Updates

```typescript
const updateJob = useUpdateJob({
  onMutate: async (newJob) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['jobs'] });

    // Snapshot previous value
    const previousJobs = queryClient.getQueryData(['jobs']);

    // Optimistically update
    queryClient.setQueryData(['jobs'], (old) => ({
      ...old,
      data: old.data.map(job => 
        job.id === newJob.id ? { ...job, ...newJob.data } : job
      ),
    }));

    return { previousJobs };
  },
  onError: (err, newJob, context) => {
    // Rollback on error
    queryClient.setQueryData(['jobs'], context.previousJobs);
  },
});
```

## Available Hooks

### Jobs
- `useJobs(params)` - List jobs
- `useJob(id)` - Get single job
- `useCreateJob()` - Create job
- `useUpdateJob()` - Update job
- `useDeleteJob()` - Delete job

### Services
- `useServices(params)` - List services
- `useService(id)` - Get single service
- `useCreateService()` - Create service
- `useUpdateService()` - Update service

### Profiles
- `useProfiles(params)` - List profiles
- `useProfile(id)` - Get single profile
- `useUpdateProfile()` - Update profile

### Applications
- `useApplications(params)` - List applications
- `useCreateApplication()` - Submit application

### Orders
- `useOrders(params)` - List orders
- `useOrder(id)` - Get single order

### Messaging
- `useConversations()` - List conversations
- `useMessages(conversationId)` - Get messages
- `useSendMessage()` - Send message

### Notifications
- `useNotifications()` - Get notifications
- `useNotificationCount()` - Get unread count

### User
- `useCurrentUser()` - Get current user

## Migration Checklist

For each page:

- [ ] Remove mock data imports
- [ ] Import appropriate hooks from `useApi.ts`
- [ ] Replace useState with useQuery/useMutation
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add empty states
- [ ] Test CRUD operations
- [ ] Verify toast notifications
- [ ] Check pagination (if applicable)
- [ ] Test search/filters (if applicable)

## Testing

### Manual Testing
1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `npm run dev`
3. Test each page:
   - Data loads correctly
   - Loading states show
   - Errors display properly
   - CRUD operations work
   - Toast notifications appear

### React Query Devtools
- Open devtools (bottom-left icon)
- View query states
- Inspect cached data
- Trigger refetches manually

## Troubleshooting

### Data not loading
- Check `VITE_API_URL` in `.env`
- Verify backend is running
- Check browser console for errors
- Inspect Network tab for failed requests

### 401 Errors
- Ensure user is logged in
- Check token in localStorage
- Verify token refresh is working

### Stale data
- Adjust `staleTime` in QueryClient config
- Use `refetchInterval` for real-time data
- Call `invalidateQueries` after mutations

## Best Practices

1. **Always handle loading and error states**
2. **Use optimistic updates for better UX**
3. **Invalidate queries after mutations**
4. **Use query keys consistently**
5. **Enable React Query Devtools in development**
6. **Set appropriate staleTime and cacheTime**
7. **Use suspense boundaries for error handling**
8. **Implement retry logic for failed requests**

## Next Steps

1. Update each page following the patterns above
2. Test all CRUD operations
3. Implement WebSocket for real-time updates (Messages, Notifications)
4. Add infinite scroll for large lists
5. Implement advanced filtering and sorting
6. Add data prefetching for better performance

## Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [API Client README](./api/README.md)
- Backend API Documentation: `http://localhost:3001/api`
