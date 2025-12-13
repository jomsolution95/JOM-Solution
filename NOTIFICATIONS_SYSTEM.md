# In-App Notifications System

## Overview

Complete in-app notifications system with WebSocket real-time updates, polling fallback, sidebar panel, and comprehensive notification management.

## Features Implemented ✅

### 1. **NotificationsPanel Component** ✅

Full-featured sidebar panel:
- ✅ Slide-in animation from right
- ✅ Mobile responsive (full screen on mobile)
- ✅ Filter: All / Unread
- ✅ Mark as read (individual)
- ✅ Mark all as read
- ✅ Delete notifications
- ✅ Click to navigate to related content
- ✅ Real-time updates via WebSocket
- ✅ Polling fallback
- ✅ Empty states
- ✅ Loading states

### 2. **Notification Types** ✅

Six notification categories with distinct icons and colors:

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| **Application** | 💼 Briefcase | Blue | New job applications |
| **Message** | 💬 MessageSquare | Green | New messages |
| **Order** | 🛒 ShoppingCart | Purple | Order updates |
| **Payment** | 💳 CreditCard | Yellow | Payment confirmations |
| **Follower** | 👤 UserPlus | Pink | New followers |
| **System** | 🔔 Bell | Gray | System notifications |

### 3. **Real-time Updates** ✅

**WebSocket** (Primary):
```typescript
const { newNotification, unreadCount } = useRealtimeNotifications();

// Auto-refetch when new notification arrives
useEffect(() => {
  if (newNotification) {
    refetch();
  }
}, [newNotification]);
```

**Polling** (Fallback):
```typescript
const { data } = useNotifications({
  refetchInterval: 30000, // Poll every 30s if WebSocket fails
});
```

### 4. **Badge in Header** ✅

Dynamic notification badge:
```typescript
<Bell className="w-5 h-5" />
{unreadCount > 0 && (
  <span className="badge">
    {unreadCount > 99 ? '99+' : unreadCount}
  </span>
)}
```

### 5. **Read/Unread State** ✅

Visual indicators:
- **Unread**: Blue background + blue dot
- **Read**: White background, no dot

Actions:
- Click notification → Mark as read
- "Mark all read" button
- Individual "Mark as read" button

### 6. **Navigation** ✅

Smart routing based on notification type:
```typescript
const getNotificationLink = (notification) => {
  switch (notification.type) {
    case 'application': return `/jobs/${jobId}`;
    case 'message': return '/messages';
    case 'order': return `/orders/${orderId}`;
    case 'payment': return '/billing';
    case 'follower': return `/profile/${userId}`;
    default: return '/dashboard';
  }
};
```

## Usage

### Opening Panel

```typescript
// In Navbar
const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);

<button onClick={() => setIsNotificationsPanelOpen(true)}>
  <Bell />
  {unreadCount > 0 && <span>{unreadCount}</span>}
</button>

<NotificationsPanel
  isOpen={isNotificationsPanelOpen}
  onClose={() => setIsNotificationsPanelOpen(false)}
/>
```

### Notification Structure

```typescript
interface Notification {
  _id: string;
  type: 'application' | 'message' | 'order' | 'payment' | 'follower' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    userId?: string;
    jobId?: string;
    orderId?: string;
    amount?: number;
  };
}
```

### Example Notifications

#### New Job Application
```json
{
  "type": "application",
  "title": "New Application",
  "message": "John Doe applied for Senior Developer position",
  "read": false,
  "metadata": {
    "userId": "123",
    "jobId": "456"
  }
}
```

#### New Message
```json
{
  "type": "message",
  "title": "New Message",
  "message": "Sarah sent you a message",
  "read": false,
  "metadata": {
    "userId": "789"
  }
}
```

#### Order Update
```json
{
  "type": "order",
  "title": "Order Completed",
  "message": "Your order #1234 has been completed",
  "read": false,
  "metadata": {
    "orderId": "1234"
  }
}
```

#### Payment Received
```json
{
  "type": "payment",
  "title": "Payment Received",
  "message": "You received $500 for your service",
  "read": false,
  "metadata": {
    "amount": 500,
    "orderId": "1234"
  }
}
```

#### New Follower
```json
{
  "type": "follower",
  "title": "New Follower",
  "message": "Alice started following you",
  "read": false,
  "metadata": {
    "userId": "999"
  }
}
```

## Backend Integration

### API Endpoints

```typescript
// Get all notifications
GET /api/notifications
Response: {
  data: Notification[],
  total: number,
  unread: number
}

// Get unread count
GET /api/notifications/unread-count
Response: { count: number }

// Mark as read
PATCH /api/notifications/:id/read
Response: { success: true }

// Delete notification
DELETE /api/notifications/:id
Response: { success: true }
```

### WebSocket Events

```typescript
// Server → Client
socket.on('notification', (notification: Notification) => {
  // New notification received
  setNewNotification(notification);
  setUnreadCount(prev => prev + 1);
  toast.info(notification.message);
});

socket.on('unreadCount', (count: number) => {
  // Updated unread count
  setUnreadCount(count);
});
```

## Features

### 1. Real-time Updates

Notifications appear instantly via WebSocket:
```typescript
// Backend sends notification
io.to(userId).emit('notification', {
  type: 'message',
  title: 'New Message',
  message: 'You have a new message',
});

// Frontend receives and displays
useEffect(() => {
  if (newNotification) {
    // Show toast
    toast.info(newNotification.message);
    
    // Refetch list
    refetch();
  }
}, [newNotification]);
```

### 2. Polling Fallback

If WebSocket disconnects:
```typescript
const { data } = useNotifications({
  refetchInterval: 30000, // Poll every 30s
  refetchIntervalInBackground: false,
});
```

### 3. Relative Timestamps

Human-readable time:
```typescript
import { formatDistanceToNow } from 'date-fns';

formatDistanceToNow(new Date(notification.createdAt), {
  addSuffix: true,
});
// "2 minutes ago"
// "1 hour ago"
// "3 days ago"
```

### 4. Filtering

```typescript
const [filter, setFilter] = useState<'all' | 'unread'>('all');

const filteredNotifications = filter === 'unread'
  ? notifications.filter(n => !n.read)
  : notifications;
```

### 5. Batch Actions

```typescript
const handleMarkAllAsRead = async () => {
  const unreadIds = notifications
    .filter(n => !n.read)
    .map(n => n._id);
    
  await Promise.all(
    unreadIds.map(id => notificationsApi.markAsRead(id))
  );
  
  refetch();
};
```

## Styling

### Panel Animation

```css
/* Slide in from right */
.animate-in.slide-in-from-right {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
```

### Unread Indicator

```typescript
// Blue background for unread
className={`${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}

// Blue dot
{!notification.read && (
  <div className="w-2 h-2 bg-blue-600 rounded-full" />
)}
```

### Badge

```typescript
// Red badge with count
<span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
  {unreadCount > 99 ? '99+' : unreadCount}
</span>
```

## Best Practices

1. **Always show unread count** in badge
2. **Auto-mark as read** when user clicks notification
3. **Group notifications** by date (Today, Yesterday, This Week)
4. **Limit notifications** to last 30 days
5. **Paginate** if more than 50 notifications
6. **Show toast** for new notifications
7. **Play sound** for important notifications (optional)
8. **Vibrate** on mobile (optional)
9. **Request permission** for browser notifications
10. **Respect user preferences** (mute, frequency)

## Performance

### Optimization

```typescript
// Debounce mark as read
const debouncedMarkAsRead = useMemo(
  () => debounce(markAsRead, 500),
  []
);

// Virtual scrolling for long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={notifications.length}
  itemSize={80}
>
  {NotificationRow}
</FixedSizeList>
```

### Caching

```typescript
// React Query caches notifications
const { data } = useNotifications({
  staleTime: 60000, // 1 minute
  cacheTime: 300000, // 5 minutes
});
```

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ ARIA labels
- ✅ Screen reader support
- ✅ Focus management
- ✅ Color contrast (WCAG AA)

## Future Enhancements

- [ ] Notification preferences (email, push, in-app)
- [ ] Notification categories (mute specific types)
- [ ] Notification grouping (combine similar)
- [ ] Notification scheduling (digest mode)
- [ ] Push notifications (browser API)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Notification templates
- [ ] Notification analytics
- [ ] A/B testing

## Resources

- NotificationsPanel: `src/components/NotificationsPanel.tsx`
- Navbar Integration: `src/components/Navbar.tsx`
- Real-time Hook: `src/hooks/useRealtime.ts`
- API Services: `src/api/services.ts`
- [date-fns](https://date-fns.org/)
