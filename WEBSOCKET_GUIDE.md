# Real-time WebSocket Integration Guide

## Overview

Complete WebSocket integration using socket.io-client for real-time messaging and notifications.

## Features Implemented ✅

### 1. **useRealtime() Hook** (`src/hooks/useRealtime.ts`)

Core WebSocket management hook with:
- ✅ Automatic connection/disconnection
- ✅ Auto-reconnection with exponential backoff
- ✅ JWT token authentication
- ✅ Connection state management
- ✅ Event subscription/unsubscription
- ✅ Error handling with toast notifications

### 2. **useRealtimeMessages() Hook**

Specialized hook for real-time messaging:
- ✅ Join/leave conversation rooms
- ✅ Listen for new messages
- ✅ Send messages via WebSocket
- ✅ Automatic cleanup

### 3. **useRealtimeNotifications() Hook**

Specialized hook for real-time notifications:
- ✅ Listen for new notifications
- ✅ Unread count tracking
- ✅ Toast notifications for new events
- ✅ Mark as read functionality

### 4. **Navbar Integration**

- ✅ Dynamic notification badge
- ✅ Real-time unread count
- ✅ Link to notifications page

## Installation

```bash
npm install socket.io-client
```

**Status**: ✅ Installed

## Usage Examples

### 1. Basic WebSocket Connection

```typescript
import { useRealtime } from '../hooks/useRealtime';

function MyComponent() {
  const { isConnected, emit, on, off } = useRealtime({
    onConnect: () => console.log('Connected!'),
    onDisconnect: () => console.log('Disconnected'),
    onError: (error) => console.error('Error:', error),
  });

  useEffect(() => {
    // Subscribe to custom event
    const handleCustomEvent = (data) => {
      console.log('Received:', data);
    };

    on('customEvent', handleCustomEvent);

    // Cleanup
    return () => {
      off('customEvent', handleCustomEvent);
    };
  }, [on, off]);

  const sendData = () => {
    emit('customEvent', { message: 'Hello!' });
  };

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={sendData}>Send Data</button>
    </div>
  );
}
```

### 2. Real-time Messaging

```typescript
import { useRealtimeMessages } from '../hooks/useRealtime';
import { useMessages } from '../hooks/useApi';

function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState('');
  
  // Fetch initial messages from API
  const { data: messages } = useMessages(selectedConversationId);
  
  // Real-time updates
  const { newMessage, sendMessage, isConnected } = useRealtimeMessages(selectedConversationId);

  useEffect(() => {
    if (newMessage) {
      // Update UI with new message
      console.log('New message:', newMessage);
      // Optionally invalidate React Query cache
      queryClient.invalidateQueries(['messages', selectedConversationId]);
    }
  }, [newMessage]);

  const handleSend = (content: string) => {
    sendMessage(content);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} />
    </div>
  );
}
```

### 3. Real-time Notifications

```typescript
import { useRealtimeNotifications } from '../hooks/useRealtime';

function NotificationBadge() {
  const { unreadCount, newNotification } = useRealtimeNotifications();

  useEffect(() => {
    if (newNotification) {
      // Play sound, show animation, etc.
      console.log('New notification:', newNotification);
    }
  }, [newNotification]);

  return (
    <button className="relative">
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
```

### 4. Navbar Integration (Already Implemented)

```typescript
import { useRealtimeNotifications } from '../hooks/useRealtime';

export const Navbar = () => {
  const { unreadCount } = useRealtimeNotifications();

  return (
    <nav>
      <Link to="/notifications" className="relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </Link>
    </nav>
  );
};
```

## WebSocket Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `joinConversation` | `{ conversationId }` | Join a conversation room |
| `leaveConversation` | `{ conversationId }` | Leave a conversation room |
| `sendMessage` | `{ conversationId, content }` | Send a message |
| `typing` | `{ conversationId }` | User is typing |
| `stopTyping` | `{ conversationId }` | User stopped typing |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `newMessage` | `Message` | New message in conversation |
| `notification` | `Notification` | New notification |
| `unreadCount` | `number` | Updated unread count |
| `userTyping` | `{ userId, conversationId }` | User is typing |
| `userStoppedTyping` | `{ userId, conversationId }` | User stopped typing |

## Connection Lifecycle

```
┌─────────────┐
│   User      │
│   Logs In   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  useRealtime()  │
│  Hook Mounted   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Get JWT Token  │
│  from Storage   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Connect to WS  │
│  with Token     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  'connect'      │
│  Event Fired    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Subscribe to   │
│  Events         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Real-time      │
│  Communication  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  User Logs Out  │
│  or Unmount     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Disconnect     │
│  Cleanup        │
└─────────────────┘
```

## Auto-Reconnection

The hook automatically handles reconnection:

1. **Connection Lost**: Detects disconnect
2. **Retry**: Attempts to reconnect (max 5 attempts)
3. **Exponential Backoff**: 1s, 2s, 4s, 8s, 16s delays
4. **Success**: Resumes normal operation
5. **Failure**: Shows error toast after max attempts

## Error Handling

### Connection Errors

```typescript
const { isConnected } = useRealtime({
  onError: (error) => {
    // Log to monitoring service
    console.error('WebSocket error:', error);
    
    // Show user-friendly message
    if (error.message.includes('authentication')) {
      toast.error('Session expired. Please log in again.');
    }
  },
});
```

### Network Errors

- **Offline**: Automatically pauses reconnection
- **Online**: Resumes reconnection attempts
- **Timeout**: Shows warning after 30s

## Performance Optimization

### 1. Lazy Connection

```typescript
// Don't connect until needed
const { connect } = useRealtime({ autoConnect: false });

// Connect when user opens messages
useEffect(() => {
  if (isMessagesPageOpen) {
    connect();
  }
}, [isMessagesPageOpen]);
```

### 2. Event Cleanup

```typescript
useEffect(() => {
  const handler = (data) => console.log(data);
  
  on('event', handler);
  
  // Always cleanup
  return () => off('event', handler);
}, [on, off]);
```

### 3. Debounce Typing Events

```typescript
const debouncedTyping = useMemo(
  () => debounce(() => emit('typing', { conversationId }), 300),
  [emit, conversationId]
);
```

## Security

### 1. Token Authentication

- JWT token sent in `auth` handshake
- Backend validates token on connection
- Invalid token → connection rejected

### 2. Room Authorization

- Backend verifies user can join conversation
- Unauthorized users are kicked from room

### 3. Rate Limiting

- Backend limits events per second
- Prevents spam and abuse

## Testing

### Manual Testing

1. **Connection**:
   - Login
   - Check browser console for "✅ WebSocket connected"
   - Verify `isConnected` is true

2. **Messaging**:
   - Open conversation
   - Send message
   - Verify message appears in real-time
   - Open same conversation in another tab
   - Verify message syncs

3. **Notifications**:
   - Trigger notification (e.g., new order)
   - Verify toast appears
   - Verify badge count updates
   - Click notification
   - Verify count decreases

4. **Reconnection**:
   - Disconnect network
   - Verify "Disconnected" status
   - Reconnect network
   - Verify auto-reconnection

### Browser DevTools

```javascript
// In console
window.socketDebug = true;

// View socket instance
console.log(window.__SOCKET__);

// Manually emit event
window.__SOCKET__.emit('testEvent', { data: 'test' });
```

## Troubleshooting

### Not Connecting

- Check `VITE_API_URL` environment variable
- Verify backend WebSocket server is running
- Check browser console for errors
- Verify JWT token is valid

### Events Not Received

- Check event name spelling
- Verify room was joined
- Check backend is emitting events
- Use React Query Devtools to verify

### High Memory Usage

- Ensure event listeners are cleaned up
- Check for memory leaks in event handlers
- Use Chrome DevTools Memory Profiler

### Duplicate Messages

- Verify only one socket connection exists
- Check for duplicate event listeners
- Use `off()` before `on()` to prevent duplicates

## Best Practices

1. **Always cleanup** event listeners in `useEffect`
2. **Use specialized hooks** (`useRealtimeMessages`) instead of raw `useRealtime`
3. **Combine with React Query** for optimal data management
4. **Handle offline state** gracefully
5. **Show connection status** to users
6. **Debounce frequent events** (typing, scrolling)
7. **Use rooms** for targeted messaging
8. **Validate data** received from WebSocket

## Integration with React Query

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeMessages } from '../hooks/useRealtime';

function Messages() {
  const queryClient = useQueryClient();
  const { newMessage } = useRealtimeMessages(conversationId);

  useEffect(() => {
    if (newMessage) {
      // Optimistically update cache
      queryClient.setQueryData(
        ['messages', conversationId],
        (old) => [...old, newMessage]
      );
      
      // Or invalidate to refetch
      // queryClient.invalidateQueries(['messages', conversationId]);
    }
  }, [newMessage, queryClient, conversationId]);
}
```

## Next Steps

1. ✅ Implement typing indicators
2. ✅ Add read receipts
3. ✅ Implement presence (online/offline status)
4. ✅ Add message reactions
5. ✅ Implement voice/video call signaling
6. ✅ Add file upload progress via WebSocket

## Resources

- Hook Implementation: `src/hooks/useRealtime.ts`
- Navbar Integration: `src/components/Navbar.tsx`
- Backend Gateway: `backend/src/modules/messaging/messaging.gateway.ts`
- Backend Notifications: `backend/src/modules/notifications/notifications.gateway.ts`
