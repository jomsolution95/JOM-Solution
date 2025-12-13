# Analytics & Tracking Guide

## Overview

Comprehensive analytics setup with Google Analytics 4 and Hotjar for tracking user behavior, conversions, and engagement.

## Features Implemented ✅

### 1. **Google Analytics 4** ✅

Complete GA4 integration:
- ✅ Page view tracking
- ✅ Event tracking
- ✅ Enhanced ecommerce
- ✅ User properties
- ✅ Custom dimensions
- ✅ Conversion tracking

### 2. **Hotjar** ✅

Heatmaps and user behavior:
- ✅ Session recordings
- ✅ Heatmaps
- ✅ User feedback
- ✅ Event triggers
- ✅ User identification

## Setup

### Environment Variables

Add to `.env.production`:

```env
VITE_ENABLE_ANALYTICS=true
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_HOTJAR_ID=1234567
VITE_HOTJAR_SV=6
```

### Initialize Analytics

```typescript
// src/main.tsx or src/App.tsx
import { initGA } from './utils/analytics';
import { initHotjar } from './utils/hotjar';

// Initialize on app start
if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  initGA(import.meta.env.VITE_GA_MEASUREMENT_ID);
  initHotjar(
    parseInt(import.meta.env.VITE_HOTJAR_ID),
    parseInt(import.meta.env.VITE_HOTJAR_SV)
  );
}
```

### Automatic Page Tracking

```typescript
// src/App.tsx
import { usePageTracking } from './hooks/usePageTracking';

function App() {
  usePageTracking(); // Auto-track all page views
  
  return <Router>...</Router>;
}
```

## Tracking Events

### Premium Conversions

```typescript
import { trackPremiumConversion } from './utils/analytics';
import { trackHotjarPremiumUpgrade } from './utils/hotjar';

// When user upgrades to premium
const handleUpgrade = async (plan: string, price: number) => {
  await upgradeToPremium(plan);
  
  // Track in GA4
  trackPremiumConversion(plan, price);
  
  // Track in Hotjar
  trackHotjarPremiumUpgrade(plan);
};
```

**Tracked Data**:
- Plan type (monthly/yearly)
- Price
- Transaction ID
- Timestamp

### Profile Views

```typescript
import { trackProfileView } from './utils/analytics';
import { trackHotjarProfileView } from './utils/hotjar';

// When viewing a profile
useEffect(() => {
  trackProfileView(profileId, 'user');
  trackHotjarProfileView('user');
}, [profileId]);
```

**Tracked Data**:
- Profile ID
- Profile type (user/company)
- Viewer ID
- View duration

### ATS Interactions

```typescript
import { 
  trackATSInteraction,
  trackApplicationSubmit,
  trackApplicationStatusChange 
} from './utils/analytics';

// View job
trackATSInteraction('view_job', jobId);

// Apply to job
const handleApply = async () => {
  await submitApplication(jobId);
  trackApplicationSubmit(jobId, jobTitle);
};

// Status change
trackApplicationStatusChange(appId, 'applied', 'interview');
```

**Tracked Events**:
- Job views
- Applications submitted
- Applications saved
- Jobs shared
- Status changes

### Social Engagement

```typescript
import { 
  trackSocialEngagement,
  trackPostCreation,
  trackConnection 
} from './utils/analytics';

// Like post
const handleLike = () => {
  trackSocialEngagement('like', 'post', postId);
};

// Create post
const handleCreatePost = () => {
  trackPostCreation('image');
};

// Send connection request
const handleConnect = () => {
  trackConnection('send', userId);
};
```

**Tracked Events**:
- Likes
- Comments
- Shares
- Follows
- Connections
- Post creation

### Service Marketplace

```typescript
import { trackServiceView, trackServiceOrder } from './utils/analytics';

// View service
useEffect(() => {
  trackServiceView(serviceId, category);
}, [serviceId]);

// Order service
const handleOrder = async () => {
  await createOrder(serviceId);
  trackServiceOrder(serviceId, title, price);
};
```

**Tracked Events**:
- Service views
- Service orders
- Category browsing
- Search queries

### Search

```typescript
import { trackSearch } from './utils/analytics';

const handleSearch = (query: string) => {
  trackSearch(query, 'jobs');
};
```

### User Authentication

```typescript
import { trackSignUp, trackLogin } from './utils/analytics';

// Sign up
trackSignUp('email');

// Login
trackLogin('google');
```

## Custom Events

### Track Custom Event

```typescript
import { trackEvent } from './utils/analytics';

trackEvent(
  'Category',    // Event category
  'Action',      // Event action
  'Label',       // Optional label
  100            // Optional value
);
```

### Hotjar Custom Event

```typescript
import { triggerHotjarEvent } from './utils/hotjar';

triggerHotjarEvent('custom_event_name');
```

## User Identification

### Set User ID

```typescript
import { setUserId } from './utils/analytics';
import { identifyHotjarUser } from './utils/hotjar';

// After login
const user = await login();

setUserId(user.id);
identifyHotjarUser(user.id, {
  email: user.email,
  name: user.name,
  plan: user.plan,
});
```

### Set User Properties

```typescript
import { setUserProperties } from './utils/analytics';

setUserProperties({
  user_type: 'premium',
  account_age: 30,
  total_posts: 50,
});
```

## Conversion Tracking

### Premium Conversion Funnel

```
1. View Premium Page
   → trackPageView('/premium')
   → trackHotjarPremiumView()

2. Select Plan
   → trackEvent('Premium', 'Select_Plan', 'monthly')

3. Checkout
   → trackPageView('/checkout')

4. Payment Success
   → trackPremiumConversion('monthly', 5000)
   → trackHotjarPremiumUpgrade('monthly')
```

### Job Application Funnel

```
1. View Job
   → trackATSInteraction('view_job', jobId)

2. Click Apply
   → trackEvent('ATS', 'Click_Apply', jobId)

3. Fill Form
   → trackEvent('ATS', 'Form_Progress', '50%')

4. Submit
   → trackApplicationSubmit(jobId, jobTitle)
```

## Enhanced Ecommerce

### Product Views

```typescript
ReactGA.event('view_item', {
  items: [{
    item_id: 'service_123',
    item_name: 'Web Design',
    item_category: 'Design',
    price: 5000,
  }],
});
```

### Purchases

```typescript
ReactGA.event('purchase', {
  transaction_id: 'txn_123',
  value: 5000,
  currency: 'XOF',
  items: [{
    item_id: 'premium_monthly',
    item_name: 'Premium Monthly',
    price: 5000,
    quantity: 1,
  }],
});
```

## Performance Tracking

```typescript
import { trackPerformance } from './utils/analytics';

// Track load time
window.addEventListener('load', () => {
  const loadTime = performance.now();
  trackPerformance('page_load', loadTime);
});

// Track API response time
const start = Date.now();
await api.get('/data');
const duration = Date.now() - start;
trackPerformance('api_response', duration);
```

## Error Tracking

```typescript
import { trackError } from './utils/analytics';

try {
  await riskyOperation();
} catch (error) {
  trackError('API_Error', error.message);
}
```

## Privacy & GDPR

### Anonymize IP

```typescript
// Already configured in initGA
ReactGA.initialize(measurementId, {
  gaOptions: {
    anonymizeIp: true,
  },
});
```

### Opt-out

```typescript
// Allow users to opt-out
const disableAnalytics = () => {
  window[`ga-disable-${measurementId}`] = true;
  localStorage.setItem('analytics_disabled', 'true');
};
```

### Cookie Consent

```typescript
// Only initialize after consent
const handleConsent = (accepted: boolean) => {
  if (accepted) {
    initGA(measurementId);
    initHotjar(hjid, hjsv);
  }
};
```

## Dashboard & Reports

### Google Analytics 4

**Key Reports**:
- Real-time users
- Acquisition overview
- Engagement overview
- Conversions
- User demographics
- Behavior flow

**Custom Reports**:
- Premium conversions by plan
- Job application funnel
- Service marketplace performance
- Social engagement metrics

### Hotjar

**Features**:
- Session recordings
- Heatmaps (click, move, scroll)
- Conversion funnels
- Form analysis
- Feedback polls
- User surveys

## Testing

### Development

```typescript
// Disable in development
if (import.meta.env.DEV) {
  console.log('Analytics disabled in development');
}
```

### Debug Mode

```typescript
// Enable GA4 debug mode
ReactGA.initialize(measurementId, {
  gaOptions: {
    debug_mode: true,
  },
});
```

### Test Events

```bash
# Use GA4 DebugView
# Events appear in real-time
```

## Best Practices

1. **Track User Intent**: Focus on meaningful actions
2. **Respect Privacy**: Anonymize PII
3. **Optimize Performance**: Load analytics async
4. **Test Thoroughly**: Verify events in DebugView
5. **Document Events**: Maintain event catalog
6. **Monitor Regularly**: Review reports weekly

## Event Catalog

| Category | Action | Label | Value |
|----------|--------|-------|-------|
| Premium | Conversion | Plan name | Price |
| Profile | View | Profile ID | - |
| ATS | Apply | Job ID | - |
| Social | Like | Post ID | - |
| Marketplace | Order | Service ID | Price |
| Search | Query | Search term | - |

## Resources

- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Hotjar Documentation](https://help.hotjar.com/)
- [React GA4](https://github.com/PriceRunner/react-ga4)
- [GDPR Compliance](https://support.google.com/analytics/answer/9019185)
