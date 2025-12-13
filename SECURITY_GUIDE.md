# Frontend Security Guide

## Overview

Comprehensive frontend security implementation with XSS protection, input sanitization, form validation, unified error handling, API timeouts, and intelligent retry logic.

## Security Features Implemented ✅

### 1. **XSS Protection with DOMPurify** ✅

Sanitize all user-generated content:

```typescript
import { sanitizeHtml, sanitizeText, sanitizeUrl } from './utils/security';

// Sanitize HTML (allows safe tags)
const clean = sanitizeHtml(userInput);

// Strip all HTML
const plainText = sanitizeText(userInput);

// Sanitize URLs (blocks javascript:, data:)
const safeUrl = sanitizeUrl(url);
```

**Use Cases**:
- User profiles (bio, about)
- Comments and reviews
- Post content
- Messages

### 2. **Input Sanitization** ✅

All inputs are sanitized before processing:

```typescript
// Email sanitization
const email = sanitizeEmail('USER@EXAMPLE.COM'); // → 'user@example.com'

// Phone sanitization
const phone = sanitizePhone('+221 77 123 45 67'); // → '+221771234567'

// Search query sanitization
const query = sanitizeSearchQuery('<script>alert("xss")</script>'); // → ''

// Filename sanitization
const filename = sanitizeFilename('../../etc/passwd'); // → '_._._etc_passwd'
```

### 3. **Form Validation with Zod** ✅

Type-safe validation schemas:

```typescript
import { loginSchema, registerSchema, serviceSchema } from './utils/validation';

// Validate login
const result = validateForm(loginSchema, {
  email: 'user@example.com',
  password: 'password123',
});

if (result.success) {
  // result.data is type-safe
  await login(result.data);
} else {
  // result.errors contains field errors
  console.log(result.errors);
}
```

**Available Schemas**:
- `loginSchema` - Email + password
- `registerSchema` - Name, email, password, confirmPassword
- `profileSchema` - Name, email, phone, bio
- `serviceSchema` - Service creation
- `jobSchema` - Job posting
- `contactSchema` - Contact form
- `paymentSchema` - Payment details
- `reviewSchema` - Rating + comment

### 4. **Real-time Validation Hook** ✅

Custom React hook for forms:

```typescript
import { useFormValidation } from './hooks/useFormValidation';
import { loginSchema } from './utils/validation';

const LoginForm = () => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = 
    useFormValidation({
      schema: loginSchema,
      initialValues: { email: '', password: '' },
      onSubmit: async (data) => {
        await login(data);
      },
    });

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
      />
      {touched.email && errors.email && <span>{errors.email}</span>}
    </form>
  );
};
```

### 5. **API Security Enhancements** ✅

**Intelligent Retry Logic**:
```typescript
// Automatic retry with exponential backoff
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx
    return error.response?.status >= 500 || !error.response;
  },
});
```

**Request Sanitization**:
```typescript
// All request data is sanitized
apiClient.interceptors.request.use((config) => {
  if (config.data) {
    config.data = sanitizeObject(config.data);
  }
  return config;
});
```

**Timeout Configuration**:
```typescript
// 30-second timeout for all requests
timeout: 30000
```

### 6. **Password Validation** ✅

Strong password requirements:

```typescript
const result = validatePassword('MyP@ssw0rd');

// result = {
//   valid: true,
//   strength: 'strong',
//   error: undefined
// }
```

**Requirements**:
- Minimum 8 characters
- Uppercase letters
- Lowercase letters
- Numbers or special characters

**Strength Levels**:
- **Weak**: Missing requirements
- **Medium**: Has uppercase, lowercase, and numbers/special chars
- **Strong**: Has all character types

### 7. **Rate Limiting** ✅

Client-side rate limiting:

```typescript
import { RateLimiter } from './utils/security';

// Allow 5 requests per 60 seconds
const limiter = new RateLimiter(5, 60000);

if (limiter.canProceed()) {
  // Make API call
  await api.post('/endpoint');
} else {
  toast.error('Too many requests. Please wait.');
}
```

### 8. **Object Sanitization** ✅

Recursively sanitize objects:

```typescript
const unsafeData = {
  name: '<script>alert("xss")</script>',
  bio: 'Hello <b>world</b>',
  nested: {
    field: '<img src=x onerror=alert(1)>',
  },
};

const safe = sanitizeObject(unsafeData);
// All strings are sanitized recursively
```

## Security Best Practices

### 1. Always Sanitize User Input

```typescript
// ❌ Bad
const bio = userInput;

// ✅ Good
const bio = sanitizeHtml(userInput);
```

### 2. Validate Before Submission

```typescript
// ❌ Bad
await api.post('/profile', formData);

// ✅ Good
const result = validateForm(profileSchema, formData);
if (result.success) {
  await api.post('/profile', result.data);
}
```

### 3. Use Type-Safe Schemas

```typescript
// ❌ Bad
if (email.includes('@')) { ... }

// ✅ Good
const result = loginSchema.safeParse({ email, password });
```

### 4. Sanitize URLs

```typescript
// ❌ Bad
<a href={userProvidedUrl}>Link</a>

// ✅ Good
<a href={sanitizeUrl(userProvidedUrl)}>Link</a>
```

### 5. Escape HTML in Display

```typescript
// ❌ Bad
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Good
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />
```

## Error Handling

### Unified Error Handler

All API errors are handled consistently:

```typescript
try {
  await api.post('/endpoint', data);
} catch (error) {
  // Automatically handled by interceptor
  // Shows toast notification
  // Logs error
  // Redirects if needed
}
```

### Custom Error Messages

```typescript
import { handleApiError } from './api/errorHandler';

try {
  await api.post('/endpoint');
} catch (error) {
  handleApiError(error, {
    400: 'Invalid input',
    404: 'Resource not found',
    500: 'Server error',
  });
}
```

## Dependencies Installed

```bash
npm install dompurify validator axios-retry zod
npm install --save-dev @types/dompurify @types/validator
```

## Usage Examples

### Login Form with Validation

```typescript
import { useFormValidation } from './hooks/useFormValidation';
import { loginSchema } from './utils/validation';

const LoginForm = () => {
  const { values, errors, handleChange, handleBlur, handleSubmit, isSubmitting } = 
    useFormValidation({
      schema: loginSchema,
      initialValues: { email: '', password: '' },
      onSubmit: async (data) => {
        await login(data);
      },
    });

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
      />
      {errors.email && <span className="error">{errors.email}</span>}

      <input
        type="password"
        value={values.password}
        onChange={(e) => handleChange('password', e.target.value)}
        onBlur={() => handleBlur('password')}
      />
      {errors.password && <span className="error">{errors.password}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### Sanitizing User Content

```typescript
import { sanitizeHtml } from './utils/security';

const UserProfile = ({ user }) => {
  return (
    <div>
      <h1>{user.name}</h1>
      <div 
        dangerouslySetInnerHTML={{ 
          __html: sanitizeHtml(user.bio) 
        }} 
      />
    </div>
  );
};
```

### API Call with Retry

```typescript
// Automatically retries on failure
const fetchData = async () => {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    // After 3 retries, error is thrown
    console.error('Failed after retries');
  }
};
```

## Security Checklist

- [x] XSS protection with DOMPurify
- [x] Input sanitization for all user inputs
- [x] Form validation with Zod schemas
- [x] Password strength validation
- [x] URL sanitization
- [x] Email validation
- [x] Phone number validation
- [x] API request sanitization
- [x] Intelligent retry logic
- [x] Timeout configuration
- [x] Rate limiting
- [x] Error handling
- [x] Type safety with TypeScript

## Resources

- Security Utils: `src/utils/security.ts`
- Validation Schemas: `src/utils/validation.ts`
- Form Hook: `src/hooks/useFormValidation.ts`
- API Client: `src/api/client.ts`
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Zod](https://zod.dev/)
- [Validator.js](https://github.com/validatorjs/validator.js)
