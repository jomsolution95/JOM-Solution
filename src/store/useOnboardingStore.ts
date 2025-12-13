import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
    hasSeenGuide: Record<string, boolean>; // e.g., { 'candidate_dashboard': true }
    activeGuide: string | null;
    currentStep: number;
    isTourActive: boolean;

    startTour: (guideId: string) => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
    endTour: () => void;
    resetTours: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            hasSeenGuide: {},
            activeGuide: null,
            currentStep: 0,
            isTourActive: false,

            startTour: (guideId) => {
                const { hasSeenGuide } = get();
                // Only start if not seen (or if we want to force start, logic can be added later)
                if (!hasSeenGuide[guideId]) {
                    set({
                        activeGuide: guideId,
                        currentStep: 0,
                        isTourActive: true,
                    });
                }
            },

            nextStep: () => {
                set((state) => ({ currentStep: state.currentStep + 1 }));
            },

            prevStep: () => {
                set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) }));
            },

            skipTour: () => {
                const { activeGuide } = get();
                if (activeGuide) {
                    set((state) => ({
                        isTourActive: false,
                        activeGuide: null,
                        hasSeenGuide: { ...state.hasSeenGuide, [activeGuide]: true },
                    }));
                }
            },

            endTour: () => {
                const { activeGuide } = get();
                if (activeGuide) {
                    set((state) => ({
                        isTourActive: false,
                        activeGuide: null,
                        hasSeenGuide: { ...state.hasSeenGuide, [activeGuide]: true },
                    }));
                }
            },

            resetTours: () => {
                set({ hasSeenGuide: {}, activeGuide: null, isTourActive: false, currentStep: 0 });
            },
        }),
        {
            name: 'jom-onboarding-storage',
            partialize: (state) => ({ hasSeenGuide: state.hasSeenGuide }), // Only persist seen status
        }
    )
);
