# Frontend Authentication System

## Overview

Complete authentication system with real backend integration, role-based access control, and dynamic routing based on user roles.

## Features Implemented ✅

### 1. **Real AuthContext** (`src/context/AuthContext.tsx`)
- ✅ Backend API integration (login, register, logout)
- ✅ Token management (access + refresh tokens in localStorage)
- ✅ User state management
- ✅ Role-based helper functions
- ✅ Auto-initialization from localStorage
- ✅ Toast notifications for auth events

### 2. **Protected Routes** (`src/components/ProtectedRoute.tsx`)
- ✅ `<ProtectedRoute>` - Requires authentication
- ✅ `<PublicRoute>` - Redirects authenticated users
- ✅ Role-based access control
- ✅ Dynamic redirects based on user role
- ✅ Loading states during auth check

### 3. **useAuth() Hook**
Global hook available throughout the app:

```typescript
const {
  user,              // Current user object
  isLoading,         // Auth initialization loading
  isAuthenticated,   // Boolean auth status
  login,             // Login function
  register,          // Register function
  logout,            // Logout function
  hasRole,           // Check single role
  hasAnyRole,        // Check multiple roles
} = useAuth();
```

## User Object Structure

```typescript
interface User {
  _id: string;
  email: string;
  roles: string[];      // ['freelancer', 'client', 'admin']
  isVerified: boolean;
  createdAt: string;
}
```

## Available Roles

- `freelancer` - Service providers
- `client` - Service buyers
- `admin` - Platform administrators

## Usage Examples

### 1. Login Page

```typescript
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Automatic redirect handled by PublicRoute
    } catch (error) {
      // Error toast shown automatically
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### 2. Register Page

```typescript
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'freelancer' | 'client'>('freelancer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, role);
      // Automatic redirect after successful registration
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <select value={role} onChange={(e) => setRole(e.target.value as any)}>
        <option value="freelancer">Freelancer</option>
        <option value="client">Client</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
};
```

### 3. Protected Routes in App.tsx

```typescript
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public routes - redirect if authenticated */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected routes - require authentication */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Role-based protected routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/freelancer/services" element={
        <ProtectedRoute requiredRoles={['freelancer']}>
          <MyServices />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

### 4. Conditional Rendering Based on Auth

```typescript
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.email}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};
```

### 5. Role-Based UI

```typescript
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user, hasRole, hasAnyRole } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Show only to freelancers */}
      {hasRole('freelancer') && (
        <Link to="/my-services">My Services</Link>
      )}

      {/* Show only to clients */}
      {hasRole('client') && (
        <Link to="/my-orders">My Orders</Link>
      )}

      {/* Show to both freelancers and clients */}
      {hasAnyRole(['freelancer', 'client']) && (
        <Link to="/messages">Messages</Link>
      )}

      {/* Show only to admins */}
      {hasRole('admin') && (
        <Link to="/admin/users">Manage Users</Link>
      )}
    </div>
  );
};
```

### 6. Logout

```typescript
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return <button onClick={handleLogout}>Logout</button>;
};
```

## Dynamic Redirects

### After Login/Register

Users are automatically redirected based on their role:

- **Admin** → `/admin/dashboard`
- **Freelancer** → `/dashboard`
- **Client** → `/dashboard`

### Unauthorized Access

If a user tries to access a route they don't have permission for:

1. Check their role
2. Redirect to their appropriate dashboard
3. Fallback to home page if no role match

## Token Management

### Storage Strategy

**Current Implementation** (localStorage):
- `access_token` - Short-lived (15 minutes)
- `refresh_token` - Long-lived (7 days)
- `user` - User object (JSON string)

**Security Notes**:
- Tokens in localStorage are vulnerable to XSS
- For production, consider:
  - HttpOnly cookies (requires backend changes)
  - Secure flag for HTTPS only
  - SameSite attribute for CSRF protection

### Token Refresh

Automatic token refresh is handled by the API client (`src/api/client.ts`):

1. Request fails with 401
2. Interceptor catches error
3. Calls refresh endpoint with refresh token
4. Updates access token
5. Retries original request
6. If refresh fails → logout user

## Auth Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Login/Register │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  API Call       │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Store Tokens   │
│  + User Data    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Update Context │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Dynamic        │
│  Redirect       │
└─────────────────┘
```

## Migration from Mock Auth

### Before (Mock)
```typescript
const { user, login } = useAuth();

// Mock login
await login('freelancer', 'John Doe');
```

### After (Real)
```typescript
const { user, login } = useAuth();

// Real login
await login('john@example.com', 'password123');
```

## Testing

### Manual Testing

1. **Register Flow**:
   - Go to `/register`
   - Fill form with email, password, role
   - Submit
   - Verify redirect to dashboard
   - Check localStorage for tokens

2. **Login Flow**:
   - Go to `/login`
   - Enter credentials
   - Submit
   - Verify redirect based on role
   - Check user state in React Query Devtools

3. **Protected Routes**:
   - Try accessing `/dashboard` without login
   - Should redirect to `/login`
   - Login and try again
   - Should access successfully

4. **Role-Based Access**:
   - Login as freelancer
   - Try accessing admin route
   - Should redirect to freelancer dashboard

5. **Logout**:
   - Click logout
   - Verify redirect to home
   - Check localStorage is cleared
   - Try accessing protected route
   - Should redirect to login

### Automated Testing (Future)

```typescript
describe('Authentication', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should protect routes', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Tokens not persisting
- Check localStorage in DevTools
- Verify API is returning tokens
- Check for errors in console

### Infinite redirect loop
- Check ProtectedRoute logic
- Verify user roles are correct
- Check route configuration

### 401 errors after login
- Verify token is being sent in headers
- Check token format (Bearer prefix)
- Verify backend accepts the token

### User not redirecting after login
- Check PublicRoute implementation
- Verify user object has roles
- Check navigation logic

## Security Best Practices

1. **Never log tokens** to console in production
2. **Clear tokens** on logout
3. **Validate tokens** on every request
4. **Use HTTPS** in production
5. **Implement CSRF** protection
6. **Set short expiry** for access tokens
7. **Rotate refresh tokens** on use
8. **Monitor failed** login attempts

## Next Steps

1. ✅ Replace AuthGuard with ProtectedRoute in App.tsx
2. ✅ Update Login page with real API
3. ✅ Update Register page with real API
4. ✅ Add email verification flow
5. ✅ Implement password reset
6. ✅ Add social login (Google, Facebook)
7. ✅ Implement 2FA (optional)
8. ✅ Add session timeout warning

## Resources

- AuthContext: `src/context/AuthContext.tsx`
- ProtectedRoute: `src/components/ProtectedRoute.tsx`
- API Client: `src/api/client.ts`
- Auth API: `src/api/auth.ts`
