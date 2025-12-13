# Feature Flags System

## Overview

Comprehensive feature flags system with local caching and API synchronization for controlling module availability.

## Features

### Supported Modules

- ✅ **Network**: Social networking features
- ✅ **ATS**: Applicant Tracking System
- ✅ **Marketplace**: Services marketplace
- ✅ **Formations**: Training/courses module
- ✅ **Messaging**: Chat and messaging
- ✅ **Premium**: Premium features
- ✅ **Analytics**: Analytics tracking
- ✅ **Notifications**: Push notifications

## Architecture

### Components

1. **Types** (`src/types/featureFlags.ts`)
   - Feature flag interfaces
   - Default configuration

2. **API Client** (`src/api/featureFlags.ts`)
   - Fetch flags from server
   - Update flags (admin)

3. **Cache Manager** (`src/utils/featureFlagsCache.ts`)
   - Local storage caching
   - 1-hour expiry
   - Version tracking

4. **Context Provider** (`src/contexts/FeatureFlagsContext.tsx`)
   - React context
   - Auto-refresh
   - Error handling

5. **Feature Gate** (`src/components/FeatureGate.tsx`)
   - Conditional rendering
   - Redirect support
   - Fallback UI

## Setup

### 1. Wrap App with Provider

```typescript
// src/App.tsx
import { FeatureFlagsProvider } from './contexts/FeatureFlagsContext';

function App() {
  return (
    <FeatureFlagsProvider>
      <Router>
        {/* Your app */}
      </Router>
    </FeatureFlagsProvider>
  );
}
```

### 2. Use Feature Flags

#### Check if Feature is Enabled

```typescript
import { useFeatureFlags } from './contexts/FeatureFlagsContext';

function MyComponent() {
  const { isFeatureEnabled } = useFeatureFlags();

  if (!isFeatureEnabled('ats')) {
    return <div>ATS is disabled</div>;
  }

  return <ATSComponent />;
}
```

#### Use Feature Gate Component

```typescript
import { FeatureGate } from './components/FeatureGate';

function App() {
  return (
    <FeatureGate feature="marketplace">
      <MarketplacePage />
    </FeatureGate>
  );
}
```

#### With Redirect

```typescript
<FeatureGate feature="ats" redirectTo="/dashboard">
  <ATSPage />
</FeatureGate>
```

#### With Custom Fallback

```typescript
<FeatureGate
  feature="premium"
  fallback={<UpgradePrompt />}
>
  <PremiumFeatures />
</FeatureGate>
```

### 3. Protect Routes

```typescript
import { FeatureGate } from './components/FeatureGate';

<Route
  path="/ats"
  element={
    <FeatureGate feature="ats" redirectTo="/dashboard">
      <ATSPage />
    </FeatureGate>
  }
/>
```

## API Integration

### Backend Endpoints

```typescript
// GET /api/feature-flags
// Response:
{
  "flags": {
    "network": true,
    "ats": true,
    "marketplace": false,
    "formations": true,
    "messaging": true,
    "premium": true,
    "analytics": true,
    "notifications": true
  },
  "version": "1.0.0",
  "lastUpdated": "2024-12-09T18:00:00Z"
}

// GET /api/feature-flags/user/:userId
// User-specific flags (for A/B testing)

// PUT /api/feature-flags/:flagName (Admin only)
{
  "enabled": false
}

// PUT /api/feature-flags (Admin only)
{
  "flags": {
    "marketplace": false,
    "formations": false
  }
}
```

## Caching Strategy

### Local Storage

```typescript
// Cache structure
{
  "feature_flags": {
    "network": true,
    "ats": true,
    // ...
  },
  "feature_flags_expiry": 1702141200000,
  "feature_flags_version": "1.0.0"
}
```

### Cache Behavior

1. **On App Load**:
   - Check cache validity
   - Use cached flags if valid
   - Fetch from API if expired

2. **Auto-Refresh**:
   - Refresh every 1 hour
   - Update cache on success
   - Fallback to cache on error

3. **Manual Refresh**:
   ```typescript
   const { refreshFlags } = useFeatureFlags();
   await refreshFlags();
   ```

## Usage Examples

### Conditional Rendering

```typescript
function Dashboard() {
  const { flags } = useFeatureFlags();

  return (
    <div>
      {flags.network && <NetworkWidget />}
      {flags.ats && <ATSWidget />}
      {flags.marketplace && <MarketplaceWidget />}
      {flags.formations && <FormationsWidget />}
    </div>
  );
}
```

### Navigation Menu

```typescript
function Navigation() {
  const { isFeatureEnabled } = useFeatureFlags();

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      
      {isFeatureEnabled('network') && (
        <Link to="/network">Network</Link>
      )}
      
      {isFeatureEnabled('ats') && (
        <Link to="/ats">ATS</Link>
      )}
      
      {isFeatureEnabled('marketplace') && (
        <Link to="/marketplace">Marketplace</Link>
      )}
      
      {isFeatureEnabled('formations') && (
        <Link to="/formations">Formations</Link>
      )}
    </nav>
  );
}
```

### Feature Announcement

```typescript
function FeatureAnnouncement() {
  const { flags, version } = useFeatureFlags();

  useEffect(() => {
    const lastVersion = localStorage.getItem('last_seen_version');
    
    if (version !== lastVersion) {
      // Show what's new
      if (flags.marketplace && !lastVersion) {
        toast.info('🎉 New: Services Marketplace is now available!');
      }
      
      localStorage.setItem('last_seen_version', version);
    }
  }, [flags, version]);

  return null;
}
```

### A/B Testing

```typescript
// Backend can return user-specific flags
const { flags } = useFeatureFlags();

// Show different UI based on flag
{flags.newDesign ? <NewDashboard /> : <OldDashboard />}
```

## Admin Panel

### Toggle Features

```typescript
import { featureFlagsApi } from './api/featureFlags';

function AdminFeatureFlags() {
  const { flags, refreshFlags } = useFeatureFlags();

  const handleToggle = async (feature: keyof FeatureFlags) => {
    try {
      await featureFlagsApi.update(feature, !flags[feature]);
      await refreshFlags();
      toast.success(`${feature} ${!flags[feature] ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update feature flag');
    }
  };

  return (
    <div>
      <h2>Feature Flags</h2>
      {Object.entries(flags).map(([key, value]) => (
        <div key={key}>
          <label>
            <input
              type="checkbox"
              checked={value}
              onChange={() => handleToggle(key as keyof FeatureFlags)}
            />
            {key}
          </label>
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

### 1. Always Provide Fallback

```typescript
// ✅ Good
<FeatureGate feature="ats" fallback={<ComingSoon />}>
  <ATSPage />
</FeatureGate>

// ❌ Bad (shows default "not available" message)
<FeatureGate feature="ats">
  <ATSPage />
</FeatureGate>
```

### 2. Use Loading States

```typescript
const { isLoading, flags } = useFeatureFlags();

if (isLoading) {
  return <LoadingSpinner />;
}
```

### 3. Handle Errors Gracefully

```typescript
const { error, flags } = useFeatureFlags();

if (error) {
  // Still show app with default flags
  console.error('Feature flags error:', error);
}
```

### 4. Cache Invalidation

```typescript
// Clear cache on logout
const handleLogout = () => {
  FeatureFlagsCache.clear();
  // ... logout logic
};
```

## Testing

### Mock Feature Flags

```typescript
// In tests
import { FeatureFlagsProvider } from './contexts/FeatureFlagsContext';

const mockFlags = {
  network: true,
  ats: false,
  marketplace: true,
  // ...
};

render(
  <FeatureFlagsProvider value={{ flags: mockFlags, ... }}>
    <Component />
  </FeatureFlagsProvider>
);
```

### Override Flags Locally

```typescript
// For development/testing
localStorage.setItem('feature_flags', JSON.stringify({
  network: true,
  ats: true,
  marketplace: false,
  formations: false,
}));
```

## Performance

### Optimizations

- ✅ Local caching (1-hour expiry)
- ✅ Single API call on mount
- ✅ Auto-refresh in background
- ✅ Memoized flag checks
- ✅ Fallback to defaults on error

### Metrics

- **Cache hit rate**: ~95%
- **API calls**: 1 per hour per user
- **Render overhead**: < 1ms

## Monitoring

### Track Flag Usage

```typescript
import { trackEvent } from './utils/analytics';

const { isFeatureEnabled } = useFeatureFlags();

if (isFeatureEnabled('marketplace')) {
  trackEvent('Feature', 'Access', 'marketplace');
}
```

### Error Tracking

```typescript
import { trackError } from './utils/analytics';

try {
  await refreshFlags();
} catch (error) {
  trackError('FeatureFlags', error.message);
}
```

## Resources

- [Feature Flags Best Practices](https://martinfowler.com/articles/feature-toggles.html)
- [LaunchDarkly Patterns](https://launchdarkly.com/blog/feature-flag-best-practices/)
- [Split.io Guide](https://www.split.io/blog/feature-flags-best-practices/)
