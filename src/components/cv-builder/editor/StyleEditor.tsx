import React from 'react';
import { useCVStore } from '../../../stores/useCVStore';
import { SectionWrapper } from './SectionWrapper';
import { Palette, Type } from 'lucide-react';

const COLORS = [
    '#1e3a8a', '#3b82f6', '#064e3b', '#10b981', '#581c87', '#8b5cf6',
    '#0f172a', '#475569', '#7f1d1d', '#b91c1c', '#c2410c', '#f97316',
    '#134e4a', '#14b8a6', '#831843', '#db2777', '#000000', '#333333'
];

const FONTS = [
    { name: 'Sans Serif (Standard)', value: 'ui-sans-serif, system-ui' },
    { name: 'Serif (Élégant)', value: 'ui-serif, Georgia' },
    { name: 'Monospace (Technique)', value: 'ui-monospace, monospace' },
    { name: 'Montserrat (Moderne)', value: 'Montserrat, sans-serif' },
    { name: 'Playfair Display (Classique)', value: 'Playfair Display, serif' },
    { name: 'Lato (Clair)', value: 'Lato, sans-serif' },
    { name: 'Open Sans (Lisible)', value: 'Open Sans, sans-serif' },
];

export const StyleEditor: React.FC = () => {
    const { theme, updateTheme } = useCVStore();

    return (
        <div className="space-y-6">
            <SectionWrapper title="Couleurs" icon={<Palette className="w-5 h-5" />} description="Personnalisez la palette de votre CV." isOpen>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Couleur Principale</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => updateTheme({ primaryColor: color })}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform ${theme.primaryColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                            <input
                                type="color"
                                value={theme.primaryColor}
                                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                                className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                                title="Couleur personnalisée"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Couleur Secondaire</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((color) => (
                                <button
                                    key={`sec-${color}`}
                                    onClick={() => updateTheme({ secondaryColor: color })}
                                    className={`w-6 h-6 rounded-full border-2 transition-transform ${theme.secondaryColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                            <input
                                type="color"
                                value={theme.secondaryColor}
                                onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                                className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                                title="Couleur personnalisée"
                            />
                        </div>
                    </div>
                </div>
            </SectionWrapper>

            <SectionWrapper title="Polices" icon={<Type className="w-5 h-5" />} description="Choisissez la typographie." isOpen>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titres</label>
                        <select
                            value={theme.fontHeading}
                            onChange={(e) => updateTheme({ fontHeading: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                        >
                            {FONTS.map((font) => (
                                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                    {font.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Corps du texte</label>
                        <select
                            value={theme.fontBody}
                            onChange={(e) => updateTheme({ fontBody: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                        >
                            {FONTS.map((font) => (
                                <option key={`body-${font.value}`} value={font.value} style={{ fontFamily: font.value }}>
                                    {font.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
};
