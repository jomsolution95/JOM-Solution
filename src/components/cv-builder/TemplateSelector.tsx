import React from 'react';
import { cvTemplates } from '../../templates/cv';
import { useCVStore } from '../../stores/useCVStore';
import { Check, X, Crown, Lock } from 'lucide-react';
import { usePremiumAccess } from '../../hooks/usePremiumAccess';
import { useNavigate } from 'react-router-dom';

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ isOpen, onClose }) => {
    const { selectedTemplateId, setSelectedTemplate } = useCVStore();
    const navigate = useNavigate();
    const { status: premiumStatus } = usePremiumAccess('premium_templates');
    const hasPremiumAccess = premiumStatus === 'allowed';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choisir un modèle</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sélectionnez un design pour votre CV. Le contenu s'adaptera automatiquement.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-gray-900/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {cvTemplates.map((template) => {
                            const isSelected = selectedTemplateId === template.id;

                            return (
                                <div
                                    key={template.id}
                                    className={`
                                        group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300
                                        ${isSelected ? 'ring-4 ring-primary-500 scale-[1.02]' : 'hover:-translate-y-1 hover:ring-2 hover:ring-primary-200 dark:hover:ring-primary-900'}
                                    `}
                                >
                                    {/* Miniature Preview (Abstract representation) */}
                                    <div className="aspect-[210/297] relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                                        <div
                                            className="absolute inset-0 p-3 transform scale-[0.4] origin-top-left w-[250%] h-[250%] pointer-events-none select-none flex flex-col"
                                            style={{
                                                backgroundColor: template.colors.background,
                                                color: template.colors.text,
                                                fontFamily: template.fonts.body
                                            }}
                                        >
                                            {/* Mock Layout Structure Based on Archetype would be cool, but simplistic for now */}
                                            {/* Header Area */}
                                            <div
                                                className={`mb-8 ${template.layout.sidebar === 'left' ? 'pl-[35%]' : ''}`} // Adjust based on sidebar
                                                style={{
                                                    textAlign: template.layout.headerStyle === 'centered' ? 'center' : 'left'
                                                }}
                                            >
                                                <div className="h-8 w-3/4 mb-2 bg-current opacity-20 rounded"></div>
                                                <div className="h-4 w-1/2 bg-current opacity-10 rounded"></div>
                                            </div>

                                            {/* Body */}
                                            <div className="flex flex-1 gap-8">
                                                {/* Sidebar Mock */}
                                                {template.layout.sidebar === 'left' && (
                                                    <div
                                                        className="w-[30%] h-full absolute left-0 top-0 bottom-0 opacity-10"
                                                        style={{ backgroundColor: template.colors.primary }}
                                                    ></div>
                                                )}

                                                <div className="flex-1 space-y-6">
                                                    <div className="h-2 w-full bg-current opacity-10 rounded"></div>
                                                    <div className="h-2 w-5/6 bg-current opacity-10 rounded"></div>
                                                    <div className="h-2 w-4/5 bg-current opacity-10 rounded"></div>
                                                    <div className="mt-8 h-2 w-full bg-current opacity-10 rounded"></div>
                                                    <div className="h-2 w-3/4 bg-current opacity-10 rounded"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                            <button
                                                onClick={() => {
                                                    if (template.isPremium && !hasPremiumAccess) {
                                                        if (window.confirm("Ce modèle est réservé aux membres Premium. Voulez-vous voir les offres ?")) {
                                                            navigate('/premium');
                                                        }
                                                        return;
                                                    }
                                                    setSelectedTemplate(template.id);
                                                    // We don't close immediately so they can browse
                                                }}
                                                className={`
                                                    w-full py-2 font-bold rounded-lg shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center justify-center gap-2
                                                    ${template.isPremium && !hasPremiumAccess
                                                        ? 'bg-gray-900 text-white hover:bg-black'
                                                        : 'bg-primary-600 text-white hover:bg-primary-700'}
                                                `}
                                            >
                                                {template.isPremium && !hasPremiumAccess ? <Lock className="w-4 h-4" /> : null}
                                                {template.isPremium && !hasPremiumAccess ? 'Débloquer' : 'Sélectionner'}
                                            </button>
                                        </div>

                                        {/* Badges */}
                                        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                                            {isSelected && (
                                                <div className="bg-primary-600 text-white p-1.5 rounded-full shadow-lg">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                            {template.isPremium && (
                                                <div className="bg-amber-400 text-black p-1.5 rounded-full shadow-lg" title="Premium Template">
                                                    <Crown className="w-4 h-4 fill-black" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate" title={template.name}>
                                            {template.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                            {template.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
