# Premium Features E2E Testing Guide

## Setup

### Install Dependencies

```bash
cd backend
npm install --save-dev @types/jest @types/supertest jest supertest ts-jest
```

### Configure Jest

The project includes:
- `test/jest-e2e.json` - E2E test configuration
- Test files in `test/` directory

### Environment Setup

Create `.env.test` file:

```env
DATABASE_URL=mongodb://localhost:27017/jom-test
JWT_SECRET=test-secret-key
STRIPE_SECRET_KEY=sk_test_...
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=us-east-1
AWS_S3_BUCKET=test-bucket
```

## Running Tests

### All E2E Tests

```bash
npm run test:e2e
```

### Specific Test Suite

```bash
npm run test:e2e -- premium-subscription.e2e-spec.ts
npm run test:e2e -- boosts.e2e-spec.ts
npm run test:e2e -- statistics.e2e-spec.ts
npm run test:e2e -- certificates-courses.e2e-spec.ts
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:cov
```

## Test Suites

### 1. Premium Subscriptions (`premium-subscription.e2e-spec.ts`)

Tests:
- ✅ Get available plans
- ✅ Purchase subscription
- ✅ Verify and activate subscription
- ✅ Get active subscription
- ✅ Prevent duplicate subscriptions
- ✅ Initialize quotas
- ✅ Increment quota usage
- ✅ Prevent quota overuse
- ✅ Reset quotas monthly
- ✅ Cancel subscription
- ✅ Block features after cancellation

**Coverage:**
- Subscription purchase flow
- Payment verification
- Quota management
- Subscription lifecycle

### 2. Boosts (`boosts.e2e-spec.ts`)

Tests:
- ✅ Create profile boost
- ✅ Get active boosts
- ✅ Increment boost views
- ✅ Get boost analytics
- ✅ Prevent duplicate boosts
- ✅ Deactivate boost
- ✅ Create job boost
- ✅ Mark job as featured
- ✅ Prioritize boosted jobs
- ✅ Consume quota on boost

**Coverage:**
- Profile boost lifecycle
- Job boost lifecycle
- Analytics tracking
- Quota consumption

### 3. Statistics (`statistics.e2e-spec.ts`)

Tests:
- ✅ Get profile stats
- ✅ Track profile views
- ✅ Get recent viewers
- ✅ Get profile ranking
- ✅ Get recruitment stats
- ✅ Get application funnel
- ✅ Get time-to-hire metrics
- ✅ Get academy stats
- ✅ Get student progress
- ✅ Get activity heatmap

**Coverage:**
- Profile statistics
- Recruitment dashboard
- Academy dashboard
- All analytics endpoints

### 4. Certificates & Courses (`certificates-courses.e2e-spec.ts`)

Tests:
- ✅ Create course
- ✅ Create module
- ✅ Add video content
- ✅ Add quiz
- ✅ Get course details
- ✅ Enroll student
- ✅ Track progress
- ✅ Submit quiz
- ✅ Get student progress
- ✅ Generate certificate
- ✅ Get my certificates
- ✅ Verify certificate
- ✅ Download certificate PDF
- ✅ Prevent duplicate certificates
- ✅ Limit free users to 3 courses
- ✅ Allow unlimited courses for premium

**Coverage:**
- Course management
- Student enrollment
- Progress tracking
- Certificate generation
- Premium vs Free limits

## Test Data

### Test Users

```typescript
// Individual Premium User
{
  email: 'test@premium.com',
  password: 'Test123!',
  plan: 'INDIVIDUAL_PREMIUM'
}

// Company User
{
  email: 'company@test.com',
  password: 'Test123!',
  type: 'company',
  plan: 'COMPANY_STANDARD'
}

// School User
{
  email: 'school@test.com',
  password: 'Test123!',
  type: 'school',
  plan: 'SCHOOL_EDU'
}

// Free User
{
  email: 'free@test.com',
  password: 'Test123!',
  plan: null
}
```

### Test Payments

```typescript
// Stripe Test Token
paymentToken: 'tok_test_visa'

// Test Transaction IDs
transactionId: 'test_transaction_123'
```

## Assertions

### Common Patterns

```typescript
// Status codes
.expect(200)  // Success
.expect(201)  // Created
.expect(400)  // Bad Request
.expect(403)  // Forbidden
.expect(404)  // Not Found

// Response structure
expect(response.body.data).toBeDefined();
expect(response.body.data).toHaveProperty('field');

// Arrays
expect(Array.isArray(response.body.items)).toBe(true);
expect(response.body.items.length).toBeGreaterThan(0);

// Numbers
expect(response.body.count).toBe(5);
expect(response.body.total).toBeGreaterThan(0);

// Strings
expect(response.body.status).toBe('active');
expect(response.body.name).toContain('Test');
```

## Mocking

### External Services

```typescript
// Mock Stripe
jest.mock('stripe', () => ({
  Stripe: jest.fn(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test',
        client_secret: 'secret_test',
      }),
    },
  })),
}));

// Mock AWS S3
jest.mock('aws-sdk', () => ({
  S3: jest.fn(() => ({
    upload: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Location: 'https://s3.amazonaws.com/test.pdf',
      }),
    }),
  })),
}));

// Mock OCR
jest.mock('tesseract.js', () => ({
  recognize: jest.fn().mockResolvedValue({
    data: {
      text: 'Test Document',
      confidence: 95,
    },
  }),
}));
```

## Database Cleanup

### Before Each Test Suite

```typescript
beforeAll(async () => {
  // Clear test database
  await mongoose.connection.dropDatabase();
});
```

### After Each Test

```typescript
afterEach(async () => {
  // Clean up test data
  await User.deleteMany({ email: /test/ });
  await Subscription.deleteMany({});
  await Boost.deleteMany({});
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: mongodb://localhost:27017/jom-test
          JWT_SECRET: test-secret
```

## Debugging

### Enable Verbose Output

```bash
npm run test:e2e -- --verbose
```

### Run Single Test

```typescript
it.only('should create subscription', async () => {
  // Test code
});
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Mocking**: Mock external services
4. **Assertions**: Use specific assertions
5. **Coverage**: Aim for >80% coverage
6. **Speed**: Keep tests fast (<5s each)
7. **Naming**: Use descriptive test names
8. **Setup**: Use beforeAll/afterAll wisely

## Coverage Goals

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

## Troubleshooting

### Database Connection Issues

```typescript
// Increase timeout
jest.setTimeout(30000);

// Check connection
beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE_URL);
});
```

### Authentication Failures

```typescript
// Ensure token is valid
const response = await request(app.getHttpServer())
  .get('/protected-route')
  .set('Authorization', `Bearer ${authToken}`)
  .expect(200);
```

### Async Issues

```typescript
// Always await async operations
await request(app.getHttpServer())
  .post('/endpoint')
  .send(data);

// Use done() callback if needed
it('should work', (done) => {
  request(app.getHttpServer())
    .get('/endpoint')
    .end((err, res) => {
      expect(res.status).toBe(200);
      done();
    });
});
```

## Next Steps

1. Add integration tests for remaining features
2. Implement load testing
3. Add performance benchmarks
4. Create test data factories
5. Implement visual regression tests
6. Add API contract tests
