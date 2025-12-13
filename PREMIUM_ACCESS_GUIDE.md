# Premium Access Control Integration Guide

## Hook: usePremiumAccess

### Purpose
Centralized hook to check premium access for any feature with consistent logic.

### Usage

```typescript
import { usePremiumAccess } from '../hooks/usePremiumAccess';

const MyComponent = () => {
  const { status, subscription, quota, isLoading } = usePremiumAccess('feature_id');
  
  if (isLoading) return <Loading />;
  
  if (status === 'upgradeRequired') {
    return <UpgradePrompt />;
  }
  
  if (status === 'forbidden') {
    return <AccessDenied />;
  }
  
  // status === 'allowed'
  return <FeatureContent />;
};
```

### Return Values

```typescript
{
  status: 'allowed' | 'forbidden' | 'upgradeRequired' | 'loading',
  subscription: {
    plan: string,
    active: boolean,
    ...
  },
  quota: {
    used: number,
    total: number,
    remaining: number,
    unlimited?: boolean
  },
  requiredPlans: string[],
  currentPlan?: string,
  isLoading: boolean
}
```

### Status Meanings

- **allowed**: User has access to the feature
- **forbidden**: User doesn't have access (quota exceeded, etc.)
- **upgradeRequired**: User needs to upgrade their plan
- **loading**: Still checking access

## Component: PremiumFeatureGuard

### Purpose
Wrapper component that automatically handles access control UI.

### Usage

```typescript
import { PremiumFeatureGuard } from '../hooks/usePremiumAccess';

export const MyFeature = () => {
  return (
    <PremiumFeatureGuard featureId="my_feature">
      <FeatureContent />
    </PremiumFeatureGuard>
  );
};
```

### Props

```typescript
{
  featureId: string;              // Feature identifier
  children: React.ReactNode;      // Content to show if allowed
  fallback?: React.ReactNode;     // Custom upgrade UI (optional)
  onUpgradeRequired?: () => void; // Callback when upgrade needed
}
```

### Automatic Behavior

1. Shows loading spinner while checking
2. Shows upgrade prompt if `upgradeRequired`
3. Shows access denied if `forbidden`
4. Shows children if `allowed`

## Feature IDs

### Individual Features
- `boost_profile` - Profile Star boost
- `stats_profile` - Profile statistics
- `application_tracking` - Application tracking
- `application_followup` - Application follow-up
- `identity_verification` - Identity verification

### Company Features
- `boost_job` - Job boost
- `stats_recruitment` - Recruitment dashboard
- `auto_broadcast` - Auto broadcasting
- `recruitment_packs` - Recruitment packs
- `cvtheque` - CV database
- `ads_manager` - Ads manager

### School Features
- `stats_academy` - Academy dashboard
- `courses` - Course management
- `certificates` - Certificate generation

## Protected Pages

### Method 1: Using PremiumFeatureGuard (Recommended)

```typescript
// MyFeatureProtected.tsx
import { PremiumFeatureGuard } from '../hooks/usePremiumAccess';
import { MyFeature } from './MyFeature';

export const MyFeatureProtected = () => {
  return (
    <PremiumFeatureGuard featureId="my_feature">
      <MyFeature />
    </PremiumFeatureGuard>
  );
};
```

### Method 2: Using Hook Directly

```typescript
// MyFeature.tsx
import { usePremiumAccess } from '../hooks/usePremiumAccess';

export const MyFeature = () => {
  const { status, quota, isLoading } = usePremiumAccess('my_feature');
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (status !== 'allowed') {
    return <UpgradePrompt />;
  }
  
  return (
    <div>
      {quota && (
        <div>Quota: {quota.remaining} / {quota.total}</div>
      )}
      <FeatureContent />
    </div>
  );
};
```

## Router Integration

Update your routes to use protected versions:

```typescript
// App.tsx or Router.tsx
import { CVthequeProtected } from './pages/CVthequeProtected';
import { PremiumStatsProtected } from './pages/PremiumStatsProtected';
// ... other protected pages

<Routes>
  <Route path="/cvtheque" element={<CVthequeProtected />} />
  <Route path="/premium-stats" element={<PremiumStatsProtected />} />
  <Route path="/recruitment-dashboard" element={<RecruitmentDashboardProtected />} />
  <Route path="/academy-dashboard" element={<AcademyDashboardProtected />} />
  <Route path="/academy/admin" element={<AcademyAdminProtected />} />
  <Route path="/my-certificates" element={<MyCertificatesProtected />} />
  <Route path="/recruitment-packs" element={<RecruitmentPacksProtected />} />
</Routes>
```

## Adding New Features

1. Add feature config to `FEATURE_CONFIG`:

```typescript
const FEATURE_CONFIG = {
  // ... existing features
  
  my_new_feature: {
    requiredPlans: ['INDIVIDUAL_PREMIUM'],
    quotaType: 'MY_QUOTA_TYPE', // optional
  },
};
```

2. Create protected page:

```typescript
// MyNewFeatureProtected.tsx
import { PremiumFeatureGuard } from '../hooks/usePremiumAccess';
import { MyNewFeature } from './MyNewFeature';

export const MyNewFeatureProtected = () => {
  return (
    <PremiumFeatureGuard featureId="my_new_feature">
      <MyNewFeature />
    </PremiumFeatureGuard>
  );
};
```

3. Add route:

```typescript
<Route path="/my-new-feature" element={<MyNewFeatureProtected />} />
```

## Quota Checking

If a feature has quota limits:

```typescript
const { quota } = usePremiumAccess('cvtheque');

// quota will be:
{
  used: 15,
  total: 50,
  remaining: 35,
  unlimited: false
}

// Display quota
{quota && !quota.unlimited && (
  <div>
    {quota.remaining} / {quota.total} restants
  </div>
)}
```

## Custom Upgrade UI

```typescript
<PremiumFeatureGuard
  featureId="my_feature"
  fallback={
    <div className="custom-upgrade-ui">
      <h2>Upgrade Required</h2>
      <button onClick={() => navigate('/premium')}>
        Upgrade Now
      </button>
    </div>
  }
>
  <FeatureContent />
</PremiumFeatureGuard>
```

## Inline Access Checks

For conditional rendering within a component:

```typescript
const MyComponent = () => {
  const { status } = usePremiumAccess('boost_profile');
  
  return (
    <div>
      <h1>My Profile</h1>
      
      {status === 'allowed' ? (
        <button>Boost Profile</button>
      ) : (
        <button onClick={() => navigate('/premium')}>
          Upgrade to Boost
        </button>
      )}
    </div>
  );
};
```

## Testing

```typescript
// Mock the hook in tests
jest.mock('../hooks/usePremiumAccess', () => ({
  usePremiumAccess: () => ({
    status: 'allowed',
    subscription: { plan: 'INDIVIDUAL_PREMIUM', active: true },
    quota: { used: 0, total: 5, remaining: 5 },
    isLoading: false,
  }),
}));
```

## Benefits

1. **Centralized Logic**: All access control in one place
2. **Consistent UX**: Same upgrade prompts everywhere
3. **Easy Maintenance**: Update one file to change all pages
4. **Type Safety**: TypeScript ensures correct usage
5. **Quota Awareness**: Automatic quota checking
6. **Loading States**: Built-in loading handling
7. **Error Handling**: Graceful degradation
