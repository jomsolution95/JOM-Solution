import { TemplateConfig, TemplateColors, TemplateFonts } from './types';
import { Modern } from './Modern';
import { Minimalist } from './Minimalist';
import { Corporate } from './Corporate';
import { Creative } from './Creative';
import { ATS } from './ATS';

// Helper to generate variants
const createVariant = (
    baseId: string,
    archetype: TemplateConfig['archetype'],
    name: string,
    colors: TemplateConfig['colors'],
    fonts: TemplateConfig['fonts'],
    layoutOverride: Partial<TemplateConfig['layout']> = {}
): TemplateConfig => ({
    id: `template_${baseId}`,
    name,
    description: `${archetype} style CV with ${name} color theme.`,
    archetype,
    colors,
    fonts,
    layout: {
        compact: false,
        headerStyle: 'full',
        sidebar: 'none',
        ...layoutOverride
    }
});

// Palettes
const Palettes = {
    BlueOcean: { primary: '#1e3a8a', secondary: '#3b82f6', text: '#1f2937', subtext: '#4b5563', background: '#ffffff', accent: '#eff6ff' },
    EmeraldCity: { primary: '#064e3b', secondary: '#10b981', text: '#1f2937', subtext: '#4b5563', background: '#ffffff', accent: '#ecfdf5' },
    RoyalPurple: { primary: '#581c87', secondary: '#8b5cf6', text: '#1f2937', subtext: '#4b5563', background: '#faf5ff', accent: '#f3e8ff' },
    SlateTech: { primary: '#0f172a', secondary: '#475569', text: '#334155', subtext: '#64748b', background: '#ffffff', accent: '#f1f5f9' },
    CrimsonProfessional: { primary: '#7f1d1d', secondary: '#b91c1c', text: '#1f2937', subtext: '#4b5563', background: '#fff1f2', accent: '#fee2e2' },
    SunsetCreative: { primary: '#c2410c', secondary: '#f97316', text: '#431407', subtext: '#7c2d12', background: '#fff7ed', accent: '#ffedd5' },
    DarkMode: { primary: '#e2e8f0', secondary: '#94a3b8', text: '#f8fafc', subtext: '#cbd5e1', background: '#0f172a', accent: '#1e293b' },
    Monochrome: { primary: '#000000', secondary: '#333333', text: '#000000', subtext: '#666666', background: '#ffffff', accent: '#eeeeee' },
    TealFresh: { primary: '#134e4a', secondary: '#14b8a6', text: '#1f2937', subtext: '#4b5563', background: '#f0fdfa', accent: '#ccfbf1' },
    BerryElegance: { primary: '#831843', secondary: '#db2777', text: '#1f2937', subtext: '#4b5563', background: '#fdf2f8', accent: '#fce7f3' },
};

// Fonts
const Fonts = {
    Standard: { headings: 'ui-sans-serif, system-ui', body: 'ui-sans-serif, system-ui' },
    Serif: { headings: 'ui-serif, Georgia', body: 'ui-serif, Georgia' },
    Mono: { headings: 'ui-monospace, monospace', body: 'ui-monospace, monospace' },
    ModernMix: { headings: 'Montserrat, sans-serif', body: 'Open Sans, sans-serif' },
    ClassicMix: { headings: 'Playfair Display, serif', body: 'Lato, sans-serif' },
};

// Helper for new 50 dynamic variants
const createDynamicVariant = (
    id: number,
    name: string,
    colors: TemplateColors = Palettes.BlueOcean,
    fonts: TemplateFonts = Fonts.Standard
): TemplateConfig => ({
    id: `template_50_${id}`,
    name,
    description: `Design #${id} - ${name} style`,
    archetype: 'Dynamic',
    variantId: id,
    colors,
    fonts,
    layout: { compact: false, sidebar: 'none', headerStyle: 'full' }, // Layout is handled by the component internally
    isPremium: id > 5 // Example: Templates 6-50 are premium
});

// Palettes for randomness (Mocking variety for 50 items)
const paletteKeys = Object.keys(Palettes);
const fontKeys = Object.keys(Fonts);

const dynamicTemplates: TemplateConfig[] = Array.from({ length: 50 }, (_, i) => {
    const id = i + 1;
    const paletteKey = paletteKeys[i % paletteKeys.length];
    // @ts-ignore
    const palette = Palettes[paletteKey];
    const fontKey = fontKeys[i % fontKeys.length];
    // @ts-ignore
    const font = Fonts[fontKey];

    return createDynamicVariant(id, `Style ${id} (${paletteKey})`, palette, font);
});

// Generating templates
export const cvTemplates: TemplateConfig[] = [
    ...dynamicTemplates,

    // --- Remastered Legacy Templates (Upgraded to Dynamic Engine) ---
    {
        id: 'modern_01', // Keeping ID for backward compat
        name: 'Modern Professional (Remastered)',
        thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&q=80',
        description: 'Design audacieux et structuré avec en-tête sombre. (Version 2.0)',
        archetype: 'Dynamic',
        variantId: 51,
        colors: {
            primary: '#1e293b',
            secondary: '#3b82f6',
            micros: '#64748b',
            text: '#334155',
            subtext: '#64748b',
            background: '#ffffff',
            accent: '#eff6ff'
        },
        fonts: { headings: 'Poppins', body: 'Inter' },
        layout: { compact: false, sidebar: 'none', headerStyle: 'full' }
    },
    {
        id: 'minimal_01',
        name: 'Clean Minimalist (Remastered)',
        thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=500&q=80',
        description: 'Élégance et simplicité. Focus sur la typographie. (Version 2.0)',
        archetype: 'Dynamic',
        variantId: 52,
        colors: {
            primary: '#111827',
            secondary: '#6b7280',
            micros: '#9ca3af',
            text: '#374151',
            subtext: '#4b5563',
            background: '#ffffff',
            accent: '#f3f4f6'
        },
        fonts: { headings: 'Arek', body: 'Inter' },
        layout: { compact: false, sidebar: 'none', headerStyle: 'centered' }
    },
    {
        id: 'corporate_01',
        name: 'Executive Corporate (Remastered)',
        thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&q=80', // Office
        description: 'Layout professionnel avec barre latérale pour experts. (Version 2.0)',
        archetype: 'Dynamic',
        variantId: 53,
        colors: {
            primary: '#1e3a8a',
            secondary: '#1d4ed8',
            micros: '#60a5fa',
            text: '#1f2937',
            subtext: '#4b5563',
            background: '#ffffff',
            accent: '#eff6ff'
        },
        fonts: { headings: 'Roboto', body: 'Open Sans' },
        layout: { compact: false, sidebar: 'left', headerStyle: 'full' }
    },
    {
        id: 'creative_01',
        name: 'Creative Studio (Remastered)',
        thumbnail: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&q=80', // Paint
        description: 'Formes abstraites et couleurs vives pour créatifs. (Version 2.0)',
        archetype: 'Dynamic',
        variantId: 54,
        colors: {
            primary: '#f43f5e',
            secondary: '#f97316',
            micros: '#fb7185',
            text: '#4b5563',
            subtext: '#71717a',
            background: '#f5f5f5',
            accent: '#fff1f2'
        },
        fonts: { headings: 'Space Grotesk', body: 'Inter' },
        layout: { compact: false, sidebar: 'none', headerStyle: 'full' }
    },
    {
        id: 'ats_01',
        name: 'ATS Optimized (Remastered)',
        thumbnail: 'https://images.unsplash.com/photo-1586282391129-76a6df840fd0?w=500&q=80', // Typewriter
        description: 'Structure sémantique parfaite pour les robots ATS. (Version 2.0)',
        archetype: 'Dynamic',
        variantId: 55,
        colors: {
            primary: '#000000',
            secondary: '#374151',
            micros: '#9ca3af',
            text: '#000000',
            subtext: '#4b5563',
            background: '#ffffff',
            accent: '#f3f4f6'
        },
        fonts: { headings: 'Merriweather', body: 'Merriweather' },
        layout: { compact: true, sidebar: 'none', headerStyle: 'centered' }
    }
];

// Map components
export const TemplateComponents: Record<string, React.FC<any>> = {
    'Modern': Modern,
    'Minimalist': Minimalist,
    'Corporate': Corporate,
    'Creative': Creative,
    'ATS': ATS,
    // 'Dynamic' will be handled specially in the builder, or we can map it here if we convert the component to match props
};
