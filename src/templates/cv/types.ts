import { CVState } from '../../stores/useCVStore';

export interface TemplateColors {
    primary: string;
    secondary: string;
    text: string;
    subtext: string;
    background: string;
    accent: string;
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
    archetype: 'Modern' | 'Minimalist' | 'Corporate' | 'Creative' | 'ATS';
    colors: TemplateColors;
    fonts: TemplateFonts;
    layout: TemplateLayout;
    isPremium?: boolean;
}

export interface TemplateProps {
    data: CVState;
    config: TemplateConfig;
}
