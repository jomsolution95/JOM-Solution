import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Jobs from '../pages/Jobs';

vi.mock('../api/client');

const mockJobs = [
    {
        _id: '1',
        title: 'Senior React Developer',
        company: 'Tech Corp',
        location: 'Dakar',
        type: 'full-time',
        salary: { min: 500000, max: 800000, currency: 'FCFA' },
        description: 'Looking for experienced React developer',
    },
    {
        _id: '2',
        title: 'UI/UX Designer',
        company: 'Design Studio',
        location: 'Remote',
        type: 'contract',
        salary: { min: 300000, max: 500000, currency: 'FCFA' },
        description: 'Creative designer needed',
    },
];

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

describe('Jobs Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders jobs list', async () => {
        const mockGet = vi.fn().mockResolvedValue({
            data: { data: mockJobs },
        });

        const api = await import('../api/client');
        api.default.get = mockGet;

        renderWithProviders(<Jobs />);

        await waitFor(() => {
            expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
            expect(screen.getByText('UI/UX Designer')).toBeInTheDocument();
        });
    });

    it('filters jobs by search query', async () => {
        const user = userEvent.setup();
        const mockGet = vi.fn().mockResolvedValue({
            data: { data: mockJobs },
        });

        const api = await import('../api/client');
        api.default.get = mockGet;

        renderWithProviders(<Jobs />);

        const searchInput = screen.getByPlaceholderText(/search jobs/i);
        await user.type(searchInput, 'React');

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith('/jobs', {
                params: expect.objectContaining({ search: 'React' }),
            });
        });
    });

    it('filters jobs by type', async () => {
        const user = userEvent.setup();
        const mockGet = vi.fn().mockResolvedValue({
            data: { data: mockJobs },
        });

        const api = await import('../api/client');
        api.default.get = mockGet;

        renderWithProviders(<Jobs />);

        const typeFilter = screen.getByLabelText(/job type/i);
        await user.selectOptions(typeFilter, 'full-time');

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith('/jobs', {
                params: expect.objectContaining({ type: 'full-time' }),
            });
        });
    });

    it('navigates to job details on card click', async () => {
        const user = userEvent.setup();
        const mockGet = vi.fn().mockResolvedValue({
            data: { data: mockJobs },
        });

        const api = await import('../api/client');
        api.default.get = mockGet;

        renderWithProviders(<Jobs />);

        await waitFor(() => {
            expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
        });

        const jobCard = screen.getByText('Senior React Developer').closest('a');
        expect(jobCard).toHaveAttribute('href', '/jobs/1');
    });

    it('shows empty state when no jobs found', async () => {
        const mockGet = vi.fn().mockResolvedValue({
            data: { data: [] },
        });

        const api = await import('../api/client');
        api.default.get = mockGet;

        renderWithProviders(<Jobs />);

        await waitFor(() => {
            expect(screen.getByText(/no jobs found/i)).toBeInTheDocument();
        });
    });

    it('displays loading skeleton while fetching', () => {
        renderWithProviders(<Jobs />);

        expect(screen.getByTestId('jobs-loading')).toBeInTheDocument();
    });

    it('handles API error gracefully', async () => {
        const mockGet = vi.fn().mockRejectedValue(new Error('API Error'));

        const api = await import('../api/client');
        api.default.get = mockGet;

        renderWithProviders(<Jobs />);

        await waitFor(() => {
            expect(screen.getByText(/failed to load jobs/i)).toBeInTheDocument();
        });
    });
});
