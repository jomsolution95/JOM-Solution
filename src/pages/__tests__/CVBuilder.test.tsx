import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CVBuilder } from '../../CVBuilder';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock dependencies
vi.mock('../../api/cv', () => ({
    cvApi: {
        save: vi.fn(),
        getById: vi.fn().mockResolvedValue({}),
    },
}));

// Mock Drag & Drop which is hard to test in JSDOM without setup
vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }: any) => <div>{children}</div>,
    closestCenter: {},
    KeyboardSensor: {},
    PointerSensor: {},
    useSensor: () => { },
    useSensors: () => { },
}));

vi.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: any) => <div>{children}</div>,
    arrayMove: (items: any[]) => items,
    sortableKeyboardCoordinates: {},
    verticalListSortingStrategy: {},
}));

describe('CVBuilder', () => {
    it('renders the builder with tabs', () => {
        render(
            <BrowserRouter>
                <CVBuilder />
            </BrowserRouter>
        );
        expect(screen.getByText('Contenu')).toBeInTheDocument();
        expect(screen.getByText('Design')).toBeInTheDocument();
    });

    it('switches to Design tab', () => {
        render(
            <BrowserRouter>
                <CVBuilder />
            </BrowserRouter>
        );
        const designTab = screen.getByText('Design');
        fireEvent.click(designTab);
        // We expect StyleEditor to be rendered (you might check for specific text in StyleEditor)
        // For now, checking if the tab class changed or content changed is enough for integration
        expect(designTab).toHaveClass('text-primary-600');
    });

    it('shows autosave indicator', () => {
        render(
            <BrowserRouter>
                <CVBuilder />
            </BrowserRouter>
        );
        // Initially it might be saved or saving
        // This is a basic render test for stability
        expect(screen.getByTitle('Sauvegarder')).toBeInTheDocument();
    });
});
