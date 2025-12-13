import { TemplateConfig } from './types';
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

// Generating 50 templates
export const cvTemplates: TemplateConfig[] = [
    // 1-10: Modern Variants
    createVariant('modern_01', 'Modern', 'Modern Blue', Palettes.BlueOcean, Fonts.Standard),
    createVariant('modern_02', 'Modern', 'Modern Emerald', Palettes.EmeraldCity, Fonts.Standard),
    createVariant('modern_03', 'Modern', 'Modern Slate', Palettes.SlateTech, Fonts.ModernMix),
    createVariant('modern_04', 'Modern', 'Modern Purple', Palettes.RoyalPurple, Fonts.ModernMix),
    createVariant('modern_05', 'Modern', 'Modern Crimson', Palettes.CrimsonProfessional, Fonts.Standard),
    createVariant('modern_06', 'Modern', 'Modern Teal', Palettes.TealFresh, Fonts.ModernMix),
    createVariant('modern_07', 'Modern', 'Modern Dark', Palettes.DarkMode, Fonts.Standard),
    createVariant('modern_08', 'Modern', 'Modern Classic', Palettes.SlateTech, Fonts.ClassicMix),
    createVariant('modern_09', 'Modern', 'Modern Berry', Palettes.BerryElegance, Fonts.Standard),
    createVariant('modern_10', 'Modern', 'Modern Sunset', Palettes.SunsetCreative, Fonts.ModernMix),

    // 11-20: Minimalist Variants
    createVariant('minimal_01', 'Minimalist', 'Minimal Clean', Palettes.Monochrome, Fonts.Standard),
    createVariant('minimal_02', 'Minimalist', 'Minimal Serif', Palettes.Monochrome, Fonts.Serif),
    createVariant('minimal_03', 'Minimalist', 'Minimal Blue', Palettes.BlueOcean, Fonts.Standard),
    createVariant('minimal_04', 'Minimalist', 'Minimal Slate', Palettes.SlateTech, Fonts.ModernMix),
    createVariant('minimal_05', 'Minimalist', 'Minimal Green', Palettes.EmeraldCity, Fonts.Standard),
    createVariant('minimal_06', 'Minimalist', 'Minimal Elegant', Palettes.SlateTech, Fonts.ClassicMix),
    createVariant('minimal_07', 'Minimalist', 'Minimal Warm', Palettes.SunsetCreative, Fonts.Serif),
    createVariant('minimal_08', 'Minimalist', 'Minimal Mono', Palettes.Monochrome, Fonts.Mono),
    createVariant('minimal_09', 'Minimalist', 'Minimal Teal', Palettes.TealFresh, Fonts.Standard),
    createVariant('minimal_10', 'Minimalist', 'Minimal Dark', Palettes.DarkMode, Fonts.Standard),

    // 31-40: Creative Variants
    createVariant('creative_01', 'Creative', 'Creative Orange', Palettes.SunsetCreative, Fonts.ModernMix),
    createVariant('creative_02', 'Creative', 'Creative Purple', Palettes.RoyalPurple, Fonts.ModernMix),
    createVariant('creative_03', 'Creative', 'Creative Teal', Palettes.TealFresh, Fonts.Standard),
    createVariant('creative_04', 'Creative', 'Creative Berry', Palettes.BerryElegance, Fonts.ClassicMix),
    createVariant('creative_05', 'Creative', 'Creative Blue', Palettes.BlueOcean, Fonts.Standard),
    createVariant('creative_06', 'Creative', 'Designer Dark', Palettes.DarkMode, Fonts.ModernMix),
    createVariant('creative_07', 'Creative', 'Artist Red', Palettes.CrimsonProfessional, Fonts.Serif),
    createVariant('creative_08', 'Creative', 'Innovator Green', Palettes.EmeraldCity, Fonts.Mono),
    createVariant('creative_09', 'Creative', 'Bold Slate', Palettes.SlateTech, Fonts.ModernMix),
    createVariant('creative_10', 'Creative', 'Vibrant', Palettes.SunsetCreative, Fonts.Standard),

    // 41-50: ATS Variants (Simple, Text Focus)
    createVariant('ats_01', 'ATS', 'ATS Standard', Palettes.Monochrome, Fonts.Standard),
    createVariant('ats_02', 'ATS', 'ATS Serif', Palettes.Monochrome, Fonts.Serif),
    createVariant('ats_03', 'ATS', 'ATS Mono', Palettes.Monochrome, Fonts.Mono),
    createVariant('ats_04', 'ATS', 'ATS Blue Header', { ...Palettes.BlueOcean, background: '#fff' }, Fonts.Standard),
    createVariant('ats_05', 'ATS', 'ATS Compact', Palettes.Monochrome, Fonts.Standard, { compact: true }),
    createVariant('ats_06', 'ATS', 'ATS Legal', Palettes.Monochrome, Fonts.Serif, { compact: true }),
    createVariant('ats_07', 'ATS', 'ATS IT', Palettes.Monochrome, Fonts.Mono, { compact: true }),
    createVariant('ats_08', 'ATS', 'ATS Executive', { ...Palettes.SlateTech, background: '#fff' }, Fonts.Serif),
    createVariant('ats_09', 'ATS', 'ATS Minimal', Palettes.Monochrome, Fonts.ModernMix),
    createVariant('ats_10', 'ATS', 'ATS Clean', Palettes.Monochrome, Fonts.ClassicMix),
];

// Map components
export const TemplateComponents: Record<string, React.FC<any>> = {
    'Modern': Modern,
    'Minimalist': Minimalist,
    'Corporate': Corporate,
    'Creative': Creative,
    'ATS': ATS,
};
