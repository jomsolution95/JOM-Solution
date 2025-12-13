import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PersonalInfo {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    linkedin: string;
    github: string;
    avatar?: string;
}

export interface Experience {
    id: string;
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

export interface Education {
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

export interface Skill {
    id: string;
    name: string;
    level: number; // 1-5 or 1-10
}

export interface Language {
    id: string;
    name: string;
    level: string; // e.g., "Fluent", "Beginner"
}

export interface Project {
    id: string;
    name: string;
    description: string;
    link: string;
}

export interface Interest {
    id: string;
    name: string;
}

export interface CVState {
    personalInfo: PersonalInfo;
    summary: string;
    experiences: Experience[];
    education: Education[];
    skills: Skill[];
    languages: Language[];
    projects: Project[];
    interests: Interest[];
    selectedTemplateId: string;
    cvId?: string; // MongoDB ID if saved
    lastSaved?: Date;

    // Actions
    setPersonalInfo: (info: Partial<PersonalInfo>) => void;
    setSummary: (summary: string) => void;
    setSelectedTemplate: (id: string) => void;
    setCvId: (id: string | undefined) => void;
    loadCV: (state: Partial<CVState>) => void;

    addExperience: (exp: Experience) => void;
    updateExperience: (id: string, exp: Partial<Experience>) => void;
    removeExperience: (id: string) => void;

    addEducation: (edu: Education) => void;
    updateEducation: (id: string, edu: Partial<Education>) => void;
    removeEducation: (id: string) => void;

    addSkill: (skill: Skill) => void;
    updateSkill: (id: string, skill: Partial<Skill>) => void;
    removeSkill: (id: string) => void;

    addLanguage: (lang: Language) => void;
    updateLanguage: (id: string, lang: Partial<Language>) => void;
    removeLanguage: (id: string) => void;

    addProject: (proj: Project) => void;
    updateProject: (id: string, proj: Partial<Project>) => void;
    removeProject: (id: string) => void;

    addInterest: (int: Interest) => void;
    removeInterest: (id: string) => void;

    reset: () => void;
    importProfile: (profileData: any) => void;

    // Builder Pro
    sectionOrder: string[];
    hiddenSections: string[];
    theme: {
        primaryColor: string;
        secondaryColor: string;
        fontHeading: string;
        fontBody: string;
    };

    setSectionOrder: (order: string[]) => void;
    toggleSectionVisibility: (sectionId: string) => void;
    updateTheme: (theme: Partial<{ primaryColor: string; secondaryColor: string; fontHeading: string; fontBody: string }>) => void;

    // History (Undo/Redo)
    past: CVState[];
    future: CVState[];
    undo: () => void;
    redo: () => void;
}

const initialState = {
    personalInfo: {
        fullName: '',
        title: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        linkedin: '',
        github: '',
    },
    summary: '',
    experiences: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    interests: [],
    selectedTemplateId: 'modern_01',
    cvId: undefined,

    // Pro Defaults
    sectionOrder: ['personalInfo', 'summary', 'experiences', 'education', 'skills', 'languages', 'projects', 'interests'],
    hiddenSections: [],
    theme: {
        primaryColor: '#1e3a8a',
        secondaryColor: '#3b82f6',
        fontHeading: 'ui-sans-serif, system-ui',
        fontBody: 'ui-sans-serif, system-ui',
    },

    past: [],
    future: [],
};

// Helper to push state to history before update
const pushHistory = (state: CVState) => {
    // We don't want to store the entire state history recursively, so we strip history fields
    const { past, future, undo, redo, ...currentState } = state as any;
    return {
        past: [...state.past, currentState].slice(-20), // Limit history to 20 steps
        future: [] // Clear future on new action
    };
};

export const useCVStore = create<CVState>()(
    persist(
        (set, get) => ({
            ...initialState,

            undo: () => {
                const { past, future, ...present } = get();
                if (past.length === 0) return;

                const previous = past[past.length - 1];
                const newPast = past.slice(0, past.length - 1);

                set({
                    ...previous,
                    past: newPast,
                    future: [present, ...future] as any, // Cast to avoid circular type issues in simple impl
                });
            },

            redo: () => {
                const { past, future, ...present } = get();
                if (future.length === 0) return;

                const next = future[0];
                const newFuture = future.slice(1);

                set({
                    ...next,
                    past: [...past, present] as any,
                    future: newFuture,
                });
            },

            setPersonalInfo: (info) =>
                set((state) => ({
                    ...pushHistory(state),
                    personalInfo: { ...state.personalInfo, ...info }
                })),

            setSummary: (summary) => set((state) => ({ ...pushHistory(state), summary })),

            setSelectedTemplate: (id) => set((state) => ({ ...pushHistory(state), selectedTemplateId: id })),

            setCvId: (id) => set({ cvId: id }), // ID change doesn't need history? Maybe better not to undo ID.

            loadCV: (partialState) => set((state) => ({
                ...state,
                ...partialState,
                // Reset history on load?
                past: [],
                future: [],
                experiences: partialState.experiences || [],
                education: partialState.education || [],
                skills: partialState.skills || [],
                languages: partialState.languages || [],
                projects: partialState.projects || [],
                interests: partialState.interests || [],
            })),

            addExperience: (exp) =>
                set((state) => ({ ...pushHistory(state), experiences: [...state.experiences, exp] })),
            updateExperience: (id, exp) =>
                set((state) => ({
                    ...pushHistory(state),
                    experiences: state.experiences.map((e) => (e.id === id ? { ...e, ...exp } : e)),
                })),
            removeExperience: (id) =>
                set((state) => ({
                    ...pushHistory(state),
                    experiences: state.experiences.filter((e) => e.id !== id),
                })),

            addEducation: (edu) =>
                set((state) => ({ ...pushHistory(state), education: [...state.education, edu] })),
            updateEducation: (id, edu) =>
                set((state) => ({
                    ...pushHistory(state),
                    education: state.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
                })),
            removeEducation: (id) =>
                set((state) => ({ ...pushHistory(state), education: state.education.filter((e) => e.id !== id) })),

            addSkill: (skill) => set((state) => ({ ...pushHistory(state), skills: [...state.skills, skill] })),
            updateSkill: (id, skill) =>
                set((state) => ({
                    ...pushHistory(state),
                    skills: state.skills.map((s) => (s.id === id ? { ...s, ...skill } : s)),
                })),
            removeSkill: (id) =>
                set((state) => ({ ...pushHistory(state), skills: state.skills.filter((s) => s.id !== id) })),

            addLanguage: (lang) =>
                set((state) => ({ ...pushHistory(state), languages: [...state.languages, lang] })),
            updateLanguage: (id, lang) =>
                set((state) => ({
                    ...pushHistory(state),
                    languages: state.languages.map((l) => (l.id === id ? { ...l, ...lang } : l)),
                })),
            removeLanguage: (id) =>
                set((state) => ({ ...pushHistory(state), languages: state.languages.filter((l) => l.id !== id) })),

            addProject: (proj) =>
                set((state) => ({ ...pushHistory(state), projects: [...state.projects, proj] })),
            updateProject: (id, proj) =>
                set((state) => ({
                    ...pushHistory(state),
                    projects: state.projects.map((p) => (p.id === id ? { ...p, ...proj } : p)),
                })),
            removeProject: (id) =>
                set((state) => ({ ...pushHistory(state), projects: state.projects.filter((p) => p.id !== id) })),

            addInterest: (int) =>
                set((state) => ({ ...pushHistory(state), interests: [...state.interests, int] })),
            removeInterest: (id) =>
                set((state) => ({ ...pushHistory(state), interests: state.interests.filter((i) => i.id !== id) })),

            reset: () => set(initialState),

            importProfile: (profileData) => {
                set((state) => ({
                    ...pushHistory(state),
                    personalInfo: {
                        ...state.personalInfo,
                        fullName: profileData.name || '',
                        title: profileData.title || '',
                    }
                }))
            },

            // Builder Pro Actions
            setSectionOrder: (order) => set((state) => ({ ...pushHistory(state), sectionOrder: order })),

            toggleSectionVisibility: (sectionId) => set((state) => {
                const hidden = state.hiddenSections.includes(sectionId)
                    ? state.hiddenSections.filter(id => id !== sectionId)
                    : [...state.hiddenSections, sectionId];
                return { ...pushHistory(state), hiddenSections: hidden };
            }),

            updateTheme: (themeUpdate) => set((state) => ({
                ...pushHistory(state),
                theme: { ...state.theme, ...themeUpdate }
            })),
        }),
        {
            name: 'cv-storage',
            partialize: (state) => {
                // exclude history from local storage to save space? Or keep it?
                // Let's exclude history from persistence to avoid heavy storage
                const { past, future, ...rest } = state;
                return rest;
            }
        }
    )
);
