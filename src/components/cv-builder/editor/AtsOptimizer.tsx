import React, { useState } from 'react';
import { useCVStore } from '../../../stores/useCVStore';
import { aiApi } from '../../../api/ai';
import { AlertCircle, CheckCircle, Shield, TrendingUp, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface AtsOptimizerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AtsOptimizer: React.FC<AtsOptimizerProps> = ({ isOpen, onClose }) => {
    const { personalInfo, experiences, skills } = useCVStore();
    const [jobTitle, setJobTitle] = useState(personalInfo.title || '');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<{ score: number; missingKeywords: string[]; improvements: string[] } | null>(null);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            // Prepare content for analysis
            const skillNames = skills.map(s => s.name);
            const content = JSON.stringify({ personalInfo, experiences });

            const data = await aiApi.analyzeCv({
                jobTitle: jobTitle || 'Général',
                cvContent: content,
                skills: skillNames
            });

            setResult(data);
        } catch (error) {
            console.error("ATS Analysis failed", error);
            toast.error("Échec de l'analyse ATS.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Analyseur ATS</h3>
                            <p className="text-sm text-gray-500">Optimisez votre CV pour les robots recruteurs</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {!result ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Poste visé (pour cibler les mots-clés)
                                </label>
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
                                    placeholder="Ex: Développeur React, Chef de Projet..."
                                />
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                            >
                                {isAnalyzing ? 'Analyse en cours...' : 'Lancer l\'analyse'}
                                {!isAnalyzing && <TrendingUp className="w-4 h-4" />}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            {/* Score */}
                            <div className="text-center">
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle
                                            className="text-gray-200 dark:text-gray-700"
                                            strokeWidth="8"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="58"
                                            cx="64"
                                            cy="64"
                                        />
                                        <circle
                                            className={`${result.score >= 80 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                            strokeWidth="8"
                                            strokeDasharray={365}
                                            strokeDashoffset={365 - (365 * result.score) / 100}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="58"
                                            cx="64"
                                            cy="64"
                                        />
                                    </svg>
                                    <span className="absolute text-3xl font-bold dark:text-white">{result.score}%</span>
                                </div>
                                <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {result.score >= 80 ? 'Excellent ! Votre CV est optimisé.' : 'Des améliorations sont possibles.'}
                                </p>
                            </div>

                            {/* Missing Keywords */}
                            {result.missingKeywords.length > 0 && (
                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
                                    <h4 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-4 h-4" /> Mots-clés manquants
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missingKeywords.map(keyword => (
                                            <span key={keyword} className="px-2 py-1 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 rounded text-xs text-red-600 dark:text-red-400 font-medium">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Improvements */}
                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
                                <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4" /> Conseils d'amélioration
                                </h4>
                                <ul className="space-y-2">
                                    {result.improvements.map((imp, idx) => (
                                        <li key={idx} className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500"></span>
                                            {imp}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => setResult(null)}
                                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Recommencer l'analyse
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
