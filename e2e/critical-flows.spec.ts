import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        // Navigate to login
        await page.click('text=Sign In');

        // Fill login form
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');

        // Submit form
        await page.click('button:has-text("Sign In")');

        // Wait for redirect to dashboard
        await expect(page).toHaveURL('/dashboard');

        // Verify user is logged in
        await expect(page.locator('text=Welcome back')).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.click('text=Sign In');

        await page.fill('input[type="email"]', 'wrong@example.com');
        await page.fill('input[type="password"]', 'wrongpassword');

        await page.click('button:has-text("Sign In")');

        // Verify error message
        await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    test('should register new user', async ({ page }) => {
        await page.click('text=Sign Up');

        // Fill registration form
        await page.fill('input[name="name"]', 'John Doe');
        await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
        await page.fill('input[name="password"]', 'SecurePass123!');
        await page.fill('input[name="confirmPassword"]', 'SecurePass123!');

        await page.click('button:has-text("Create Account")');

        // Verify redirect to dashboard
        await expect(page).toHaveURL('/dashboard');
    });

    test('should logout successfully', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button:has-text("Sign In")');

        await expect(page).toHaveURL('/dashboard');

        // Logout
        await page.click('[aria-label="User menu"]');
        await page.click('text=Logout');

        // Verify redirect to home
        await expect(page).toHaveURL('/');
    });

    test('should validate email format', async ({ page }) => {
        await page.click('text=Sign In');

        await page.fill('input[type="email"]', 'invalid-email');
        await page.click('input[type="password"]');

        await expect(page.locator('text=Invalid email format')).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
        await page.click('text=Sign In');

        const passwordInput = page.locator('input[type="password"]');
        await expect(passwordInput).toBeVisible();

        await page.click('[aria-label="Show password"]');

        await expect(page.locator('input[type="text"]')).toBeVisible();
    });
});

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page, context }) => {
        // Set auth token
        await context.addCookies([
            {
                name: 'access_token',
                value: 'mock-token',
                domain: 'localhost',
                path: '/',
            },
        ]);

        await page.goto('/dashboard');
    });

    test('should display user dashboard', async ({ page }) => {
        await expect(page.locator('text=Welcome back')).toBeVisible();
        await expect(page.locator('text=Quick Actions')).toBeVisible();
    });

    test('should navigate to jobs from quick action', async ({ page }) => {
        await page.click('button:has-text("Browse Jobs")');
        await expect(page).toHaveURL('/jobs');
    });

    test('should display recent activity', async ({ page }) => {
        await expect(page.locator('text=Recent Activity')).toBeVisible();
    });

    test('should show notifications', async ({ page }) => {
        await page.click('[aria-label="Notifications"]');
        await expect(page.locator('text=Notifications')).toBeVisible();
    });
});

test.describe('Jobs Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/jobs');
    });

    test('should display jobs list', async ({ page }) => {
        await expect(page.locator('[data-testid="job-card"]').first()).toBeVisible();
    });

    test('should search for jobs', async ({ page }) => {
        await page.fill('input[placeholder*="Search"]', 'React Developer');
        await page.press('input[placeholder*="Search"]', 'Enter');

        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=React')).toBeVisible();
    });

    test('should filter jobs by type', async ({ page }) => {
        await page.selectOption('select[name="type"]', 'full-time');

        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=Full-time')).toBeVisible();
    });

    test('should navigate to job details', async ({ page }) => {
        await page.click('[data-testid="job-card"]').first();

        await expect(page).toHaveURL(/\/jobs\/\w+/);
        await expect(page.locator('button:has-text("Apply")')).toBeVisible();
    });

    test('should apply to job', async ({ page, context }) => {
        // Login first
        await context.addCookies([
            {
                name: 'access_token',
                value: 'mock-token',
                domain: 'localhost',
                path: '/',
            },
        ]);

        await page.goto('/jobs');
        await page.click('[data-testid="job-card"]').first();

        await page.click('button:has-text("Apply")');

        // Fill application form
        await page.fill('textarea[name="coverLetter"]', 'I am interested in this position...');
        await page.click('button:has-text("Submit Application")');

        await expect(page.locator('text=Application submitted')).toBeVisible();
    });
});

test.describe('Services Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/services');
    });

    test('should display services marketplace', async ({ page }) => {
        await expect(page.locator('[data-testid="service-card"]').first()).toBeVisible();
    });

    test('should search services', async ({ page }) => {
        await page.fill('input[placeholder*="Search"]', 'Web Design');
        await page.press('input[placeholder*="Search"]', 'Enter');

        await page.waitForLoadState('networkidle');
    });

    test('should filter by category', async ({ page }) => {
        await page.click('button:has-text("Web Development")');

        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=Web Development')).toBeVisible();
    });

    test('should view service details', async ({ page }) => {
        await page.click('[data-testid="service-card"]').first();

        await expect(page).toHaveURL(/\/services\/\w+/);
        await expect(page.locator('button:has-text("Order Now")')).toBeVisible();
    });

    test('should order service', async ({ page, context }) => {
        // Login
        await context.addCookies([
            {
                name: 'access_token',
                value: 'mock-token',
                domain: 'localhost',
                path: '/',
            },
        ]);

        await page.goto('/services');
        await page.click('[data-testid="service-card"]').first();

        // Add requirements
        await page.fill('textarea[name="requirements"]', 'I need a modern website...');

        await page.click('button:has-text("Order Now")');

        // Verify checkout
        await expect(page).toHaveURL(/\/checkout/);
    });
});

test.describe('Messaging', () => {
    test.beforeEach(async ({ page, context }) => {
        await context.addCookies([
            {
                name: 'access_token',
                value: 'mock-token',
                domain: 'localhost',
                path: '/',
            },
        ]);

        await page.goto('/messages');
    });

    test('should display conversations list', async ({ page }) => {
        await expect(page.locator('[data-testid="conversation"]').first()).toBeVisible();
    });

    test('should open conversation', async ({ page }) => {
        await page.click('[data-testid="conversation"]').first();

        await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
    });

    test('should send message', async ({ page }) => {
        await page.click('[data-testid="conversation"]').first();

        await page.fill('[data-testid="message-input"]', 'Hello, how are you?');
        await page.click('button[aria-label="Send message"]');

        await expect(page.locator('text=Hello, how are you?')).toBeVisible();
    });

    test('should search conversations', async ({ page }) => {
        await page.fill('input[placeholder*="Search"]', 'John');

        await page.waitForLoadState('networkidle');

        await expect(page.locator('text=John')).toBeVisible();
    });

    test('should attach file to message', async ({ page }) => {
        await page.click('[data-testid="conversation"]').first();

        // Upload file
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'test.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('test file content'),
        });

        await expect(page.locator('text=test.pdf')).toBeVisible();
    });
});
