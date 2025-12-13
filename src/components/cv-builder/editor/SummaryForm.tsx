import React, { useState } from 'react';
import { useCVStore } from '../../../stores/useCVStore';
import { SectionWrapper } from './SectionWrapper';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { aiApi } from '../../../api/ai';
import { toast } from 'react-toastify';

export const SummaryForm: React.FC = () => {
    const { summary, setSummary, experiences, skills, personalInfo } = useCVStore();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await aiApi.generateSummary({
                experiences,
                skills,
                currentRole: personalInfo.title || 'Professionnel'
            });
            setSummary(result.summary);
            toast.success("Résumé généré par IA !");
        } catch (error) {
            console.error(error);
            toast.error("Erreur de génération.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <SectionWrapper title="Profil Professionnel" icon={FileText} description="Un bref résumé de votre parcours et de vos objectifs.">
            <div className="space-y-3">
                <div className="flex justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg transition-colors border border-purple-200 dark:border-purple-800"
                        title="Générer un résumé basé sur vos expériences et compétences"
                    >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {isGenerating ? 'Génération...' : 'Générer avec l\'IA'}
                    </button>
                </div>
                <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Ex: Développeur Full Stack passionné avec 5 ans d'expérience..."
                    className="w-full h-32 p-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Astuce : Soyez concis et mettez en avant vos réalisations principales.
                </p>
            </div>
        </SectionWrapper>
    );
};
