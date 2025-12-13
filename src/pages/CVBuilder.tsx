import React, { useRef } from 'react';
import {
    User,
    FileText,
    Briefcase,
    GraduationCap,
    Wrench,
    LayoutTemplate,
    RefreshCw,
    Save,
    Loader2,
    Undo2,
    Redo2,
    Cloud,
    ZoomIn,
    ZoomOut,
    Minimize,
    Sparkles,
    Share2,
    Shield
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TemplateSelector } from '../components/cv-builder/TemplateSelector';
import { PDFExportButton } from '../components/cv-builder/PDFExportButton';
import { useCVStore } from '../stores/useCVStore'; // Correct path
import { SectionWrapper } from '../components/cv-builder/editor/SectionWrapper'; // Correct path
import { PersonalForm } from '../components/cv-builder/editor/PersonalForm'; // Correct path
import { SummaryForm } from '../components/cv-builder/editor/SummaryForm';
import { ExperienceForm } from '../components/cv-builder/editor/ExperienceForm';
import { EducationForm } from '../components/cv-builder/editor/EducationForm';
import { SkillsForm } from '../components/cv-builder/editor/SkillsForm';
import { SortableSection } from '../components/cv-builder/editor/SortableSection';
import { StyleEditor } from '../components/cv-builder/editor/StyleEditor';
import { AtsOptimizer } from '../components/cv-builder/editor/AtsOptimizer';
import { CVPreview } from '../components/cv-builder/preview/CVPreview';
import { fetchAndMapProfileToCV } from '../services/cvAutoFill';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { BackButton } from '../components/BackButton';
import { cvApi } from '../api/cv';
import { profilesApi } from '../api/profiles';

export const CVBuilder: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        reset,
        importProfile,
        setPersonalInfo,
        setSummary,
        addExperience,
        addEducation,
        addSkill,
        selectedTemplateId,
        setSelectedTemplate,
        cvId,
        setCvId,
        loadCV,
        // History
        undo,
        redo,
        past,
        future,
        // Get full state for saving
        personalInfo,
        summary,
        experiences,
        education,
        skills,
        languages,
        projects,
        interests,
        // Builder Pro
        sectionOrder,
        setSectionOrder,
        hiddenSections,
        toggleSectionVisibility
    } = useCVStore();

    const componentRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
    const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
    const [activeTab, setActiveTab] = React.useState<'content' | 'design'>('content');
    const [isAtsOpen, setIsAtsOpen] = React.useState(false);
    const [zoom, setZoom] = React.useState(1);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = sectionOrder.indexOf(active.id as string);
            const newIndex = sectionOrder.indexOf(over.id as string);
            setSectionOrder(arrayMove(sectionOrder, oldIndex, newIndex));
        }
    };

    const renderSection = (id: string) => {
        const isHidden = hiddenSections.includes(id);

        switch (id) {
            case 'personalInfo':
                return (
                    <SortableSection key={id} id={id} title="Informations Personnelles" icon={User} isHidden={isHidden} onToggleVisibility={() => toggleSectionVisibility(id)}>
                        <PersonalForm />
                    </SortableSection>
                );
            case 'summary':
                return (
                    <SortableSection key={id} id={id} title="Profil Professionnel" icon={FileText} isHidden={isHidden} onToggleVisibility={() => toggleSectionVisibility(id)}>
                        <SummaryForm />
                    </SortableSection>
                );
            case 'experiences':
                return (
                    <SortableSection key={id} id={id} title="Expérience" icon={Briefcase} isHidden={isHidden} onToggleVisibility={() => toggleSectionVisibility(id)}>
                        <ExperienceForm />
                    </SortableSection>
                );
            case 'education':
                return (
                    <SortableSection key={id} id={id} title="Formation" icon={GraduationCap} isHidden={isHidden} onToggleVisibility={() => toggleSectionVisibility(id)}>
                        <EducationForm />
                    </SortableSection>
                );
            case 'skills':
                return (
                    <SortableSection key={id} id={id} title="Compétences" icon={Wrench} isHidden={isHidden} onToggleVisibility={() => toggleSectionVisibility(id)}>
                        <SkillsForm />
                    </SortableSection>
                );
            default:
                return null;
        }
    };

    // Load CV ID from URL or reset if new
    React.useEffect(() => {
        // Simple logic: if navigation state has CV data, load it (for edit).
        // Or if we want to support ?id=xyz
        const params = new URLSearchParams(location.search);
        const idFromUrl = params.get('id');

        const loadData = async () => {
            if (idFromUrl && idFromUrl !== cvId) {
                try {
                    const data = await cvApi.getOne(idFromUrl);
                    if (data) {
                        loadCV({
                            ...data.content,
                            cvId: data._id,
                            selectedTemplateId: data.templateId
                        });
                        setCvId(data._id);
                    }
                } catch (e) {
                    console.error("Failed to load CV", e);
                    toast.error("Impossible de charger le CV demandé.");
                }
            }
        };

        loadData();
    }, [location.search, cvId, loadCV, setCvId]);

    // Autosave Effect
    React.useEffect(() => {
        if (!cvId) return; // Only autosave if we have an ID (created first)

        const interval = setInterval(async () => {
            // Very simple dirty check could be: compare current state string with lastSaved string
            // But for now, we just save periodically if there are changes (handled by backend usually, but here we enforce interval)
            // A better way is checking if 'past' has changed since last save? 
            // Let's rely on interval for simplicity now.
            try {
                const content = {
                    personalInfo,
                    summary,
                    experiences,
                    education,
                    skills,
                    languages,
                    projects,
                    interests
                };
                const cvData = {
                    title: personalInfo.fullName ? `CV de ${personalInfo.fullName}` : 'Mon CV',
                    templateId: selectedTemplateId,
                    content
                };

                await cvApi.update(cvId, cvData);
                setLastSaved(new Date());
                // Optional: silent toast or small indicator
            } catch (e) {
                console.error("Autosave failed", e);
            }
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [cvId, personalInfo, summary, experiences, education, skills, languages, projects, interests, selectedTemplateId]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const content = {
                personalInfo,
                summary,
                experiences,
                education,
                skills,
                languages,
                projects,
                interests
            };

            const cvData = {
                title: personalInfo.fullName ? `CV de ${personalInfo.fullName}` : 'Mon CV',
                templateId: selectedTemplateId,
                content
            };

            if (cvId) {
                await cvApi.update(cvId, cvData);
                toast.success("CV mis à jour avec succès !");
            } else {
                const newCv = await cvApi.create(cvData);
                setCvId(newCv._id);
                // Update URL without reload to allow bookmarking/refresh
                window.history.replaceState(null, '', `/cv-builder?id=${newCv._id}`);
                toast.success("Nouveau CV sauvegardé !");
            }
            setLastSaved(new Date());
        } catch (error) {
            console.error("Save error", error);
            toast.error("Erreur lors de la sauvegarde.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublishToProfile = async () => {
        if (!cvId || !componentRef.current) return;

        if (!window.confirm("Publier ce CV sur votre profil public ? Il sera visible par les recruteurs.")) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(componentRef.current, {
                scale: 2, // Better quality
                useCORS: true,
                logging: false,
            });

            const imageBase64 = canvas.toDataURL('image/png');

            // In a real app, upload this Blob to S3 and get a URL.
            // For now, we save the Base64 (heavy, but functional for prototype) or mock it.
            // Let's assume we send the Base64 as the URL.

            await profilesApi.addDocument({
                name: `CV - ${new Date().toLocaleDateString()}`,
                url: imageBase64,
                type: 'CV / Résumé',
                date: new Date()
            });

            toast.success("CV publié sur votre profil avec succès ! 🚀");

        } catch (error) {
            console.error("Publish error", error);
            toast.error("Erreur lors de la publication.");
        }
    };


    const handleAutoFill = async () => {
        if (!window.confirm("Cela va remplacer les données actuelles par celles de votre profil. Continuer ?")) {
            return;
        }

        setIsGenerating(true);
        const result = await fetchAndMapProfileToCV();
        setIsGenerating(false);

        if (result.success && result.mappedData) {
            // Apply mapped data to store
            // We need to reset first to avoid duplicates or messy merges, or we can merge intelligently.
            // For "Auto-Fill", a reset-and-fill strategy is often cleaner, or we just overwrite specific sections.
            // Let's overwrite/set.

            if (result.mappedData.personalInfo) setPersonalInfo(result.mappedData.personalInfo);
            if (result.mappedData.summary) setSummary(result.mappedData.summary);

            // For arrays, we might want to clear existing or append. Let's clear for "Generation" context.
            // But useCVStore actions are additive usually. We need a 'setExperiences' or we iterate.
            // 'reset' clears everything.

            // To do this cleanly with current store:
            reset(); // Clear basic state

            // Re-apply personal info & summary
            if (result.mappedData.personalInfo) setPersonalInfo(result.mappedData.personalInfo);
            if (result.mappedData.summary) setSummary(result.mappedData.summary);

            // Add arrays
            result.mappedData.experiences?.forEach(exp => addExperience(exp));
            result.mappedData.education?.forEach(edu => addEducation(edu));
            result.mappedData.skills?.forEach(s => addSkill(s));

            toast.success(result.message);

            if (result.missingFields.length > 0) {
                toast.warning(`Champs manquants dans le profil : ${result.missingFields.join(', ')}`);
            }
        } else {
            toast.error(result.message);
        }
    };

    const handleImport = () => {
        // In a real app, you'd fetch the user profile from auth/api
        // For now, we mock it or use what's available
        if (window.confirm("Voulez-vous importer les données de votre profil JOM ? Cela écrasera les données actuelles.")) {
            importProfile({
                name: 'Utilisateur JOM',
                title: 'Membre Premium'
                // Add more mock data or connect to real user store
            });
        }
    };

    const handleReset = () => {
        if (window.confirm("Êtes-vous sûr de vouloir tout effacer ?")) {
            reset();
            setCvId(undefined);
            // Clear URL param
            window.history.pushState(null, '', '/cv-builder');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
            {/* Header Toolbar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <BackButton onClick={() => navigate('/dashboard')} label="Retour au Dashboard" className="!mb-0" />
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                            Créateur de CV
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsTemplateModalOpen(true)} // Needs state
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            <LayoutTemplate className="w-4 h-4" />
                            Modèles
                        </button>

                        <button
                            onClick={handleAutoFill}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            Importer Profil
                        </button>



                        <div className="flex items-center gap-1 mr-2">
                            <button
                                onClick={undo}
                                disabled={past.length === 0}
                                className={`p-2 rounded-lg transition-colors ${past.length === 0 ? 'text-gray-300 dark:text-gray-700' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                                title="Annuler (Ctrl+Z)"
                            >
                                <Undo2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={redo}
                                disabled={future.length === 0}
                                className={`p-2 rounded-lg transition-colors ${future.length === 0 ? 'text-gray-300 dark:text-gray-700' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
                                title="Rétablir (Ctrl+Y)"
                            >
                                <Redo2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

                        {lastSaved && (
                            <div className="hidden lg:flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mr-2 animate-in fade-in">
                                <Cloud className="w-3.5 h-3.5" />
                                <span>Sauvegardé</span>
                            </div>
                        )}

                        <button
                            onClick={handleReset}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Réinitialiser"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`p-2 rounded-lg transition-colors ${isSaving
                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                : 'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20'
                                }`}
                            title="Sauvegarder dans le cloud"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        </button>

                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

                        <button
                            onClick={() => setIsAtsOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                            title="Analyse ATS"
                        >
                            <Shield className="w-4 h-4" />
                            <span className="hidden lg:inline">Score ATS</span>
                        </button>

                        <button
                            onClick={handlePublishToProfile}
                            className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors mr-2 border border-purple-200"
                            title="Publier sur mon Profil"
                        >
                            <Share2 className="w-4 h-4" />
                            <span className="hidden lg:inline">Publier</span>
                        </button>

                        <PDFExportButton />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Editor */}
                <div className="w-full lg:w-1/2 xl:w-5/12 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
                    {/* Tabs Header */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'content'
                                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Contenu
                        </button>
                        <button
                            onClick={() => setActiveTab('design')}
                            className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'design'
                                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            Design
                        </button>
                    </div>

                    <div className="p-6 pb-20 overflow-y-auto flex-1">
                        <div className="max-w-2xl mx-auto space-y-6">
                            <div className="lg:hidden mb-6">
                                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                    Pour voir l'aperçu en temps réel, utilisez un écran plus large (tablette/desktop).
                                </p>
                            </div>

                            {activeTab === 'content' ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={sectionOrder}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {sectionOrder.map(id => renderSection(id))}
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <StyleEditor />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Preview */}
                <div className="hidden lg:flex w-1/2 xl:w-7/12 bg-gray-500/10 overflow-auto items-start justify-center p-8">
                    <div className="shadow-2xl print:shadow-none" ref={componentRef}>
                        <CVPreview />
                    </div>
                </div>
            </div>
            {/* Template Selection Modal */}
            <TemplateSelector isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} />

            {/* ATS Optimizer Modal */}
            <AtsOptimizer isOpen={isAtsOpen} onClose={() => setIsAtsOpen(false)} />
        </div>
    );
};
