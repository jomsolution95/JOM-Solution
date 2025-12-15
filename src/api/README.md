# API Client Module - Usage Guide

## Overview

The `/src/api` module provides a fully configured Axios client with automatic token management, request retry logic, and unified error handling.

## Features

- ✅ **Automatic Token Injection**: Access tokens are automatically added to request headers
- ✅ **Token Refresh**: Automatic refresh token flow on 401 errors
- ✅ **Request Retry**: Failed requests are retried after token refresh
- ✅ **Queue Management**: Concurrent requests are queued during token refresh
- ✅ **Error Handling**: Unified error handling with toast notifications
- ✅ **Type Safety**: Full TypeScript support

## Installation

Dependencies are already installed:
```bash
npm install axios react-toastify
```

## Configuration

### Environment Variables

Create `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000/api
```

For production:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Toast Container Setup

Add the ToastContainer to your main App component:

```tsx
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Your app content */}
    </>
  );
}
```

## Usage Examples

### Basic API Calls

```typescript
import api from '@/api';

// GET request
const fetchUsers = async () => {
  try {
    const response = await api.get('/users');
    console.log(response.data);
  } catch (error) {
    // Error is automatically handled and toast is shown
    console.error(error);
  }
};

// POST request
const createJob = async (jobData) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

// PUT request
const updateProfile = async (id, profileData) => {
  try {
    const response = await api.put(`/profiles/${id}`, profileData);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

// DELETE request
const deleteJob = async (id) => {
  try {
    await api.delete(`/jobs/${id}`);
  } catch (error) {
    console.error(error);
  }
};
```

### Authentication

```typescript
import { login, logout, isAuthenticated, getCurrentUser } from '@/api';

// Login
const handleLogin = async (email: string, password: string) => {
  try {
    const data = await login(email, password);
    console.log('Logged in user:', data.user);
    // Tokens are automatically stored
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Logout
const handleLogout = async () => {
  await logout();
  // Tokens are automatically cleared
  navigate('/login');
};

// Check authentication status
if (isAuthenticated()) {
  console.log('User is logged in');
}

// Get current user
const user = getCurrentUser();
console.log('Current user:', user);
```

### Protected Routes

```typescript
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/api';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Usage in routes
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Custom Error Handling

```typescript
import api, { getErrorMessage } from '@/api';

const fetchData = async () => {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    // Get user-friendly error message
    const message = getErrorMessage(error);
    console.error('Error:', message);
    
    // Custom handling
    if (error.response?.status === 404) {
      // Handle not found
    }
  }
};
```

### Success Messages

```typescript
import api, { handleApiSuccess } from '@/api';

const createItem = async (data) => {
  try {
    const response = await api.post('/items', data);
    handleApiSuccess('Item created successfully!');
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
```

### Using with React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/api';

// Fetch data
const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await api.get('/jobs');
      return response.data;
    },
  });
};

// Mutation
const useCreateJob = () => {
  return useMutation({
    mutationFn: async (jobData) => {
      const response = await api.post('/jobs', jobData);
      return response.data;
    },
    onSuccess: () => {
      handleApiSuccess('Job created successfully!');
    },
  });
};
```

## How It Works

### Request Flow

1. **Request Initiated**: User makes an API call
2. **Interceptor**: Request interceptor adds `Authorization: Bearer {token}` header
3. **API Call**: Request is sent to backend
4. **Response**: Backend responds

### Token Refresh Flow (on 401)

1. **401 Detected**: Response interceptor catches 401 Unauthorized
2. **Queue Requests**: Concurrent requests are queued
3. **Refresh Token**: Call `/auth/refresh` with refresh token
4. **Update Tokens**: Store new access and refresh tokens
5. **Retry Original**: Retry the original failed request with new token
6. **Process Queue**: Process all queued requests with new token

### Error Handling

1. **Error Occurs**: API returns error
2. **Interceptor**: Response interceptor catches error
3. **Parse Error**: Extract error message from response
4. **Show Toast**: Display user-friendly message
5. **Console Log**: Log detailed error for debugging
6. **Reject Promise**: Allow component to handle error

## API Module Structure

```
src/api/
├── client.ts          # Axios instance with interceptors
├── auth.ts            # Authentication helpers
├── errorHandler.ts    # Error handling utilities
└── index.ts           # Main exports
```

## Token Storage

Tokens are stored in `localStorage`:
- `access_token`: Short-lived access token (15 minutes)
- `refresh_token`: Long-lived refresh token (7 days)
- `user`: User data object

## Security Considerations

1. **XSS Protection**: Tokens in localStorage are vulnerable to XSS. Ensure your app has proper XSS protection.
2. **HTTPS**: Always use HTTPS in production to prevent token interception.
3. **Token Expiry**: Access tokens expire after 15 minutes, refresh tokens after 7 days.
4. **Automatic Logout**: User is automatically logged out if refresh token fails.

## Troubleshooting

### Tokens not being sent
- Check that tokens are stored in localStorage
- Verify `VITE_API_URL` is correct
- Check browser console for errors

### Infinite refresh loop
- Verify backend `/auth/refresh` endpoint is working
- Check that refresh token is valid
- Ensure backend returns new tokens correctly

### CORS errors
- Verify backend CORS configuration allows your frontend origin
- Check that credentials are being sent if needed

### Toast not showing
- Ensure `ToastContainer` is added to your App component
- Import toast CSS: `import 'react-toastify/dist/ReactToastify.css'`

## Advanced Usage

### Custom Headers

```typescript
import api from '@/api';

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
```

### Request Cancellation

```typescript
import api from '@/api';
import axios from 'axios';

const fetchData = async () => {
  const source = axios.CancelToken.source();
  
  try {
    const response = await api.get('/data', {
      cancelToken: source.token,
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request canceled');
    }
  }
};

// Cancel the request
source.cancel('Operation canceled by user');
```

## Best Practices

1. **Always use try-catch**: Wrap API calls in try-catch blocks
2. **Handle loading states**: Show loading indicators during API calls
3. **Validate data**: Validate data before sending to API
4. **Use TypeScript**: Define interfaces for API responses
5. **Error boundaries**: Use React error boundaries for graceful error handling
6. **Retry logic**: The client handles retries automatically for 401 errors
7. **Timeout**: Default timeout is 30 seconds, adjust if needed

## Migration from Old Code

If you have existing API calls, update them:

### Before
```typescript
const response = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### After
```typescript
import api from '@/api';

const response = await api.get('/users');
// Token is automatically added
```
