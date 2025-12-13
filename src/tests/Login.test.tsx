import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../pages/Login';

// Mock the API
vi.mock('../api/client', () => ({
    default: {
        post: vi.fn(),
    },
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
});

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>{component}</BrowserRouter>
        </QueryClientProvider>
    );
};

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders login form', () => {
        renderWithProviders(<Login />);

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Login />);

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });
    });

    it('shows error for invalid email format', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Login />);

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, 'invalid-email');
        await user.tab();

        await waitFor(() => {
            expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
        });
    });

    it('submits form with valid credentials', async () => {
        const user = userEvent.setup();
        const mockPost = vi.fn().mockResolvedValue({
            data: {
                access_token: 'mock-token',
                user: { id: '1', email: 'test@example.com' },
            },
        });

        const api = await import('../api/client');
        api.default.post = mockPost;

        renderWithProviders(<Login />);

        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/auth/login', {
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    it('displays error message on login failure', async () => {
        const user = userEvent.setup();
        const mockPost = vi.fn().mockRejectedValue({
            response: { data: { message: 'Invalid credentials' } },
        });

        const api = await import('../api/client');
        api.default.post = mockPost;

        renderWithProviders(<Login />);

        await user.type(screen.getByLabelText(/email/i), 'test@example.com');
        await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    });

    it('has link to register page', () => {
        renderWithProviders(<Login />);

        const registerLink = screen.getByRole('link', { name: /sign up/i });
        expect(registerLink).toBeInTheDocument();
        expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('has link to forgot password', () => {
        renderWithProviders(<Login />);

        const forgotLink = screen.getByRole('link', { name: /forgot password/i });
        expect(forgotLink).toBeInTheDocument();
    });

    it('toggles password visibility', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Login />);

        const passwordInput = screen.getByLabelText(/password/i);
        expect(passwordInput).toHaveAttribute('type', 'password');

        const toggleButton = screen.getByRole('button', { name: /show password/i });
        await user.click(toggleButton);

        expect(passwordInput).toHaveAttribute('type', 'text');
    });
});
