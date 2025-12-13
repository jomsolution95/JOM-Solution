# Testing Guide

## Overview

Comprehensive testing setup with Vitest for unit tests and Playwright for end-to-end tests.

## Test Coverage

### Unit Tests (Vitest)

**Pages Tested**:
- ✅ Login (`src/tests/Login.test.tsx`)
- ✅ Dashboard (`src/tests/Dashboard.test.tsx`)
- ✅ Jobs (`src/tests/Jobs.test.tsx`)

**Test Count**: 25+ unit tests

### E2E Tests (Playwright)

**Flows Tested**:
- ✅ Authentication (login, register, logout)
- ✅ Dashboard (navigation, quick actions)
- ✅ Jobs (search, filter, apply)
- ✅ Services (browse, order)
- ✅ Messaging (conversations, send messages)

**Test Count**: 30+ E2E tests

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Watch mode (auto-rerun on changes)
npm test -- --watch

# Run specific test file
npm test Login.test.tsx
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Run specific browser
npm run test:e2e -- --project=chromium

# Run specific test file
npm run test:e2e critical-flows.spec.ts
```

## Test Structure

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should complete user flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Get Started');
  
  await expect(page).toHaveURL('/dashboard');
});
```

## Test Configuration

### Vitest Config (`vitest.config.ts`)

```typescript
{
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
}
```

### Playwright Config (`playwright.config.ts`)

```typescript
{
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'Mobile Chrome' },
    { name: 'Mobile Safari' },
  ],
}
```

## Coverage Reports

### View Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Targets

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

## Best Practices

### Unit Tests

1. **Test user behavior, not implementation**
   ```typescript
   // ❌ Bad
   expect(component.state.count).toBe(1);
   
   // ✅ Good
   expect(screen.getByText('Count: 1')).toBeInTheDocument();
   ```

2. **Use semantic queries**
   ```typescript
   // ❌ Bad
   screen.getByTestId('submit-button');
   
   // ✅ Good
   screen.getByRole('button', { name: /submit/i });
   ```

3. **Mock external dependencies**
   ```typescript
   vi.mock('../api/client', () => ({
     default: {
       get: vi.fn(),
       post: vi.fn(),
     },
   }));
   ```

### E2E Tests

1. **Use data-testid for dynamic content**
   ```typescript
   <div data-testid="job-card">...</div>
   
   await page.click('[data-testid="job-card"]');
   ```

2. **Wait for network idle**
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

3. **Use page object pattern for complex flows**
   ```typescript
   class LoginPage {
     async login(email, password) {
       await this.page.fill('input[type="email"]', email);
       await this.page.fill('input[type="password"]', password);
       await this.page.click('button:has-text("Sign In")');
     }
   }
   ```

## Debugging

### Unit Tests

```bash
# Run with debugger
node --inspect-brk ./node_modules/.bin/vitest

# Use console.log
console.log(screen.debug());
```

### E2E Tests

```bash
# Debug mode (opens browser)
npm run test:e2e:debug

# Headed mode
npm run test:e2e -- --headed

# Slow motion
npm run test:e2e -- --slow-mo=1000
```

## Test Files Created

### Unit Tests
- `vitest.config.ts` - Vitest configuration
- `src/tests/setup.ts` - Test setup and mocks
- `src/tests/Login.test.tsx` - Login page tests (9 tests)
- `src/tests/Dashboard.test.tsx` - Dashboard tests (7 tests)
- `src/tests/Jobs.test.tsx` - Jobs page tests (7 tests)

### E2E Tests
- `playwright.config.ts` - Playwright configuration
- `e2e/critical-flows.spec.ts` - All critical flows (30+ tests)

## Next Steps

1. **Add more unit tests**:
   - Services page
   - Messaging page
   - Components (Navbar, Footer, etc.)

2. **Add integration tests**:
   - API integration
   - WebSocket connections
   - File uploads

3. **Add visual regression tests**:
   - Screenshot comparison
   - Percy or Chromatic integration

4. **Performance tests**:
   - Lighthouse CI
   - Bundle size monitoring

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
