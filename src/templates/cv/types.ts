import { CVState } from '../../stores/useCVStore';

export interface TemplateColors {
    primary: string;
    secondary: string;
    text: string;
    subtext: string;
    background: string;
    accent: string;
    micros?: string; // Added for detailed accents
}

export interface TemplateFonts {
    headings: string;
    body: string;
}

export interface TemplateLayout {
    compact: boolean;
    sidebar?: 'left' | 'right' | 'none';
    headerStyle?: 'full' | 'centered' | 'left' | 'split';
}

export interface TemplateConfig {
    id: string;
    name: string;
    description: string;
    previewImage?: string; // URL for the selector
    thumbnail?: string; // Added for UI previews
    archetype: 'Modern' | 'Minimalist' | 'Corporate' | 'Creative' | 'ATS' | 'Dynamic';
    colors: TemplateColors;
    fonts: TemplateFonts;
    layout: TemplateLayout;
    isPremium?: boolean;
    variantId?: number;
}

export interface TemplateProps {
    data: CVState;
    config: TemplateConfig;
}
