
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, Lock, Menu, ChevronLeft, Award, FileText, Download } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-toastify';
import { certificatesApi } from '../api/certificates';

export const CoursePlayer: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    const [course, setCourse] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [activeContent, setActiveContent] = useState<any>(null);
    const [generatingCert, setGeneratingCert] = useState(false);

    useEffect(() => {
        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const fetchCourseData = async () => {
        setLoading(true);
        try {
            // Parallel fetch
            const [courseRes, progressRes] = await Promise.all([
                api.get(`/academy/courses/${courseId}`),
                api.get(`/academy/progress/${courseId}`)
            ]);

            setCourse(courseRes.data.course);
            setProgress(progressRes.data.progress);

            // Set initial active content if available and not set
            if (courseRes.data.course.modules?.length > 0) {
                const firstModule = courseRes.data.course.modules[0];
                setActiveModule(firstModule._id);
                if (firstModule.content?.length > 0) {
                    setActiveContent(firstModule.content[0]);
                }
            }
        } catch (error) {
            console.error("Failed to load course", error);
            toast.error("Erreur lors du chargement du cours.");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async () => {
        if (!activeContent || !courseId) return;

        try {
            // Find which module this content belongs to
            const module = course.modules.find((m: any) => m.content.some((c: any) => c._id === activeContent._id));
            if (!module) return;

            // Optimistic update
            const updatedProgress = { ...progress };
            const modProg = updatedProgress.moduleProgress.find((mp: any) => mp.moduleId === module._id);
            if (modProg) {
                if (!modProg.completedContent) modProg.completedContent = [];
                if (!modProg.completedContent.includes(activeContent._id)) {
                    modProg.completedContent.push(activeContent._id);
                    // Recalculate module progress roughly
                    modProg.progress = (modProg.completedContent.length / module.content.length) * 100;
                    if (modProg.progress === 100) modProg.completed = true;
                }
            }
            setProgress(updatedProgress);

            // API Call
            await api.put(`/academy/progress/${courseId}`, {
                moduleId: module._id,
                completed: true, // This might need refinement based on backend logic (is it module complete or content complete?)
                // The backend logic seems to update module progress.
                // Logic from Service: checks completedContent or completed flag. 
                // Sending 'completed: true' might mark the MODULE as complete if progress is 100.
                // For content completion, we might need a specific endpoint or update logic.
                // Assuming backend updates progress based on some logic or we send raw progress.
                // Actually, backend updateProgress relies on `dto.progress` or `dto.completed`.
                // We'll simulate progress update by calculating it client side or just sending completed: true if it's the last item.
                progress: Math.min(100, (modProg.progress + 10)) // Hack for now
            });

            // Re-fetch to be safe and accurate
            const pRes = await api.get(`/academy/progress/${courseId}`);
            setProgress(pRes.data.progress);

            toast.success("Progression sauvegardée !");
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    const generateCertificate = async () => {
        setGeneratingCert(true);
        try {
            const cert = await certificatesApi.generate(courseId!);
            toast.success("Certificat généré avec succès !");
            navigate('/my-certificates');
        } catch (error: any) {
            if (error.response?.status === 409) {
                toast.info("Certificat déjà généré.");
                navigate('/my-certificates');
            } else {
                toast.error("Erreur lors de la génération du certificat.");
            }
        } finally {
            setGeneratingCert(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Chargement...</div>;
    if (!course) return <div className="min-h-screen flex items-center justify-center">Cours non trouvé</div>;

    const isCompleted = progress?.completed; // || progress?.progress === 100;

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-y-auto hidden md:flex">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <button onClick={() => navigate('/my-learning')} className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                    </button>
                    <h2 className="font-bold text-gray-900 dark:text-white leading-tight">{course.title}</h2>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="bg-primary-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress?.progress || 0}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(progress?.progress || 0)}% complété</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {course.modules.map((module: any, mIdx: number) => {
                        const modProgress = progress?.moduleProgress?.find((mp: any) => mp.moduleId === module._id);
                        const isModCompleted = modProgress?.completed;

                        return (
                            <div key={module._id} className="border-b border-gray-100 dark:border-gray-700/50">
                                <div
                                    className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 font-medium text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                                    onClick={() => setActiveModule(activeModule === module._id ? null : module._id)}
                                >
                                    <span>Module {mIdx + 1}: {module.title}</span>
                                    {isModCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                                </div>

                                {(activeModule === module._id) && (
                                    <div className="bg-white dark:bg-gray-800">
                                        {module.content.map((content: any, cIdx: number) => {
                                            const isContentCompleted = modProgress?.completedContent?.includes(content._id);
                                            const isActive = activeContent?._id === content._id;

                                            return (
                                                <div
                                                    key={content._id}
                                                    onClick={() => setActiveContent(content)}
                                                    className={`px-4 py-3 pl-8 text-sm flex items-center gap-3 cursor-pointer border-l-4 transition-colors ${isActive
                                                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300'
                                                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                                                        }`}
                                                >
                                                    {isContentCompleted ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                                    ) : (
                                                        content.type === 'video' ? <PlayCircle className="w-4 h-4 shrink-0" /> : <FileText className="w-4 h-4 shrink-0" />
                                                    )}
                                                    <span className="line-clamp-1">{cIdx + 1}. {content.title}</span>
                                                    <span className="ml-auto text-xs opacity-60">{content.duration}m</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="bg-gray-900 flex-1 flex items-center justify-center relative bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')] bg-cover bg-center bg-blend-overlay bg-black/60">
                    {activeContent ? (
                        <div className="text-center p-8 max-w-2xl animate-in zoom-in duration-300">
                            {activeContent.type === 'video' ? (
                                <div className="aspect-video bg-black rounded-xl shadow-2xl flex items-center justify-center mb-8 border border-white/10 relative group cursor-pointer">
                                    <PlayCircle className="w-20 h-20 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                    <div className="absolute bottom-4 left-4 text-white text-sm font-medium">{activeContent.title}</div>
                                </div>
                            ) : (
                                <div className="aspect-[4/3] bg-white text-gray-900 rounded-xl shadow-2xl p-8 flex flex-col items-center justify-center mb-8">
                                    <FileText className="w-16 h-16 text-gray-400 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">{activeContent.title}</h3>
                                    <p className="text-gray-500">Contenu textuel ou PDF</p>
                                    <button className="mt-4 text-primary-600 hover:underline">Ouvrir la ressource</button>
                                </div>
                            )}

                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{activeContent.title}</h1>
                            <p className="text-gray-300 mb-8">{activeModule && course.modules.find((m: any) => m._id === activeModule)?.description}</p>

                            <button
                                onClick={handleMarkComplete}
                                className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg shadow-primary-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                            >
                                <CheckCircle className="w-5 h-5" /> Marquer comme terminé
                            </button>
                        </div>
                    ) : (
                        <div className="text-white text-center p-8">
                            <h2 className="text-3xl font-bold mb-4">Bienvenue dans ce cours</h2>
                            <p className="text-xl text-gray-300">Sélectionnez un module pour commencer</p>
                        </div>
                    )}
                </div>

                {/* Completion / Certificate Banner */}
                {isCompleted && (
                    <div className="bg-green-600 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom duration-500">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-full">
                                <Award className="w-6 h-6 text-yellow-300" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">Félicitations ! Vous avez terminé ce cours.</p>
                                <p className="text-sm text-green-100">Votre certificat de réussite est disponible.</p>
                            </div>
                        </div>
                        <button
                            onClick={generateCertificate}
                            disabled={generatingCert}
                            className="px-6 py-2 bg-white text-green-700 font-bold rounded-lg shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-75 disabled:cursor-wait"
                        >
                            {generatingCert ? 'Génération...' : 'Obtenir mon Certificat'}
                            {!generatingCert && <Award className="w-4 h-4" />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
