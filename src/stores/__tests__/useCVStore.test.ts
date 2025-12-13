import { describe, it, expect, beforeEach } from 'vitest';
import { useCVStore } from '../useCVStore';

describe('useCVStore', () => {
    beforeEach(() => {
        useCVStore.getState().reset();
    });

    it('should update personal info', () => {
        useCVStore.getState().setPersonalInfo({ fullName: 'John Doe' });
        expect(useCVStore.getState().personalInfo.fullName).toBe('John Doe');
    });

    it('should add an experience', () => {
        const initialCount = useCVStore.getState().experiences.length;
        useCVStore.getState().addExperience();
        expect(useCVStore.getState().experiences.length).toBe(initialCount + 1);
    });

    it('should remove an experience', () => {
        useCVStore.getState().addExperience();
        const id = useCVStore.getState().experiences[0].id;
        useCVStore.getState().removeExperience(id);
        expect(useCVStore.getState().experiences.length).toBe(0);
    });

    it('should reorder sections', () => {
        const newOrder = ['education', 'experiences', 'skills', 'projects', 'languages', 'interests'];
        useCVStore.getState().reorderSections(newOrder);
        expect(useCVStore.getState().sectionOrder).toEqual(newOrder);
    });

    it('should update theme', () => {
        useCVStore.getState().updateTheme({ primaryColor: '#FF0000' });
        expect(useCVStore.getState().theme.primaryColor).toBe('#FF0000');
    });
});
