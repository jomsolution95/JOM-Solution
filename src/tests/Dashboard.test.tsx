import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../pages/Dashboard';

vi.mock('../api/client');
vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
        },
        isAuthenticated: true,
    }),
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

describe('Dashboard Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders dashboard with user greeting', () => {
        renderWithProviders(<Dashboard />);

        expect(screen.getByText(/welcome back, john/i)).toBeInTheDocument();
    });

    it('displays quick action buttons', () => {
        renderWithProviders(<Dashboard />);

        expect(screen.getByRole('button', { name: /post job/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /browse services/i })).toBeInTheDocument();
    });

    it('shows loading state while fetching data', () => {
        renderWithProviders(<Dashboard />);

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('displays recent activity feed', async () => {
        const mockGet = vi.fn().mockResolvedValue({
            data: {
                data: [
                    { id: '1', type: 'application', title: 'Applied to Senior Developer' },
                    { id: '2', type: 'message', title: 'New message from Sarah' },
                ],
            },
        });

        const api = await import('../api/client');
        api.default.get = mockGet;

        renderWithProviders(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/applied to senior developer/i)).toBeInTheDocument();
            expect(screen.getByText(/new message from sarah/i)).toBeInTheDocument();
        });
    });

    it('shows empty state when no activity', async () => {
        const mockGet = vi.fn().mockResolvedValue({
            data: { data: [] },
        });

        const api = await import('../api/client');
        api.default.get = mockGet;

        renderWithProviders(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/no recent activity/i)).toBeInTheDocument();
        });
    });

    it('navigates to jobs page on quick action click', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Dashboard />);

        const jobsButton = screen.getByRole('button', { name: /browse jobs/i });
        await user.click(jobsButton);

        // Check navigation occurred
        expect(window.location.pathname).toBe('/jobs');
    });

    it('displays notification count badge', () => {
        renderWithProviders(<Dashboard />);

        const badge = screen.getByText('3');
        expect(badge).toBeInTheDocument();
    });
});
