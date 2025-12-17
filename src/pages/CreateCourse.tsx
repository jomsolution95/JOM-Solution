
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';
import api from '../api/client';
import { toast } from 'react-toastify';
import {
    BookOpen,
    Layout,
    Video,
    FileText,
    Plus,
    Trash2,
    Save,
    ChevronRight,
    Upload,
    GripVertical
} from 'lucide-react';

// Types for the form
interface Lesson {
    title: string;
    type: 'video' | 'pdf' | 'quiz' | 'text' | 'live_session';
    url?: string;
    content?: string;
    order: number;
    duration?: number;
}

interface Module {
    title: string;
    description: string;
    lessons: Lesson[];
    order: number;
}

interface CourseForm {
    title: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    thumbnail: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    modules: Module[];
}

const CATEGORIES = [
    'Développement Web',
    'Design & Graphisme',
    'Marketing Digital',
    'Business & Entrepreneuriat',
    'Langues',
    'Développement Personnel',
    'Bureautique',
    'Autre'
];

export const CreateCourse: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState<CourseForm>({
        title: '',
        description: '',
        category: 'Développement Web',
        price: 0,
        currency: 'XOF',
        thumbnail: '',
        level: 'beginner',
        modules: [
            {
                title: 'Introduction',
                description: 'Bienvenue dans ce cours',
                order: 0,
                lessons: []
            }
        ]
    });

    // Helper to update basic fields
    const updateField = (field: keyof CourseForm, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Helper to add module
    const addModule = () => {
        setFormData(prev => ({
            ...prev,
            modules: [
                ...prev.modules,
                {
                    title: `Module ${prev.modules.length + 1}`,
                    description: '',
                    order: prev.modules.length,
                    lessons: []
                }
            ]
        }));
    };

    // Helper to update module
    const updateModule = (index: number, field: keyof Module, value: any) => {
        const newModules = [...formData.modules];
        newModules[index] = { ...newModules[index], [field]: value };
        setFormData(prev => ({ ...prev, modules: newModules }));
    };

    // Helper to remove module
    const removeModule = (index: number) => {
        if (formData.modules.length <= 1) {
            toast.warning('Le cours doit avoir au moins un module.');
            return;
        }
        const newModules = formData.modules.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, modules: newModules }));
    };

    // Helper to add lesson
    const addLesson = (moduleIndex: number) => {
        const newModules = [...formData.modules];
        newModules[moduleIndex].lessons.push({
            title: `Leçon ${newModules[moduleIndex].lessons.length + 1}`,
            type: 'video',
            order: newModules[moduleIndex].lessons.length,
            duration: 0
        });
        setFormData(prev => ({ ...prev, modules: newModules }));
    };

    // Helper to update lesson
    const updateLesson = (moduleIndex: number, lessonIndex: number, field: keyof Lesson, value: any) => {
        const newModules = [...formData.modules];
        newModules[moduleIndex].lessons[lessonIndex] = {
            ...newModules[moduleIndex].lessons[lessonIndex],
            [field]: value
        };
        setFormData(prev => ({ ...prev, modules: newModules }));
    };

    // Helper to remove lesson
    const removeLesson = (moduleIndex: number, lessonIndex: number) => {
        const newModules = [...formData.modules];
        newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
        setFormData(prev => ({ ...prev, modules: newModules }));
    };

    // Submission
    const handleSubmit = async () => {
        if (!formData.title || !formData.description) {
            toast.error('Veuillez remplir les informations de base.');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Course
            const courseRes = await api.post('/academy/courses', {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                price: formData.price,
                thumbnail: formData.thumbnail,
                level: formData.level
            });
            const courseId = courseRes.data.course._id;

            // 2. Add Modules & Lessons
            for (const mod of formData.modules) {
                // Create Module
                const modRes = await api.post(`/academy/courses/${courseId}/modules`, {
                    title: mod.title,
                    description: mod.description,
                    order: mod.order
                });

                // We need the created module ID from the updated course object.
                const updatedCourse = modRes.data.course;
                const createdModule = updatedCourse.modules[updatedCourse.modules.length - 1];

                // Add Lessons
                for (const lesson of mod.lessons) {
                    await api.post(`/academy/courses/${courseId}/modules/${createdModule._id}/content`, {
                        title: lesson.title,
                        type: lesson.type,
                        url: lesson.url || '',
                        content: lesson.content || '',
                        order: lesson.order,
                        duration: lesson.duration
                    });
                }
            }

            // 3. Publish Course if requested (Implicitly requested by clicking "Publier")
            await api.put(`/academy/courses/${courseId}`, { published: true });

            toast.success('Cours créé et publié avec succès !');
            navigate('/formations'); // Or redirect to dashboard/mylms
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Erreur lors de la création du cours');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                <BackButton />
                <div className="mt-4 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Créer un nouveau cours</h1>
                    <p className="text-gray-500 dark:text-gray-400">Partagez votre expertise avec des milliers d'étudiants</p>
                </div>

                {/* Steps Indicator */}
                <div className="flex items-center gap-4 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`flex items-center gap-2 ${step === s ? 'text-primary-600 font-bold' : 'text-gray-400'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === s ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-gray-300 text-gray-400'}`}>
                                {s}
                            </div>
                            <span className="hidden sm:inline">
                                {s === 1 ? 'Informations' : s === 2 ? 'Curriculum' : 'Révision'}
                            </span>
                            {s < 3 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">

                    {/* STEP 1: BASIC INFO */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Titre du cours</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                    placeholder="Ex: Maîtriser React de A à Z"
                                    value={formData.title}
                                    onChange={e => updateField('title', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                    placeholder="Ce que les étudiants vont apprendre..."
                                    value={formData.description}
                                    onChange={e => updateField('description', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catégorie</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        value={formData.category}
                                        onChange={e => updateField('category', e.target.value)}
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Niveau</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        value={formData.level}
                                        onChange={e => updateField('level', e.target.value)}
                                    >
                                        <option value="beginner">Débutant</option>
                                        <option value="intermediate">Intermédiaire</option>
                                        <option value="advanced">Avancé</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prix (FCFA)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        value={formData.price}
                                        onChange={e => updateField('price', parseInt(e.target.value) || 0)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Mettre 0 pour un cours gratuit.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image de couverture (URL)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        placeholder="https://..."
                                        value={formData.thumbnail}
                                        onChange={e => updateField('thumbnail', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: CURRICULUM */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contenu du cours</h3>
                                <button
                                    onClick={addModule}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" /> Ajouter un module
                                </button>
                            </div>

                            {formData.modules.map((mod, modIdx) => (
                                <div key={modIdx} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                                    <div className="p-4 bg-gray-100 dark:bg-gray-800 flex items-start gap-4 border-b border-gray-200 dark:border-gray-700">
                                        <div className="mt-2 text-gray-400 cursor-move">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="text"
                                                className="w-full bg-transparent border-none p-0 text-lg font-bold text-gray-900 dark:text-white focus:ring-0 placeholder-gray-400"
                                                placeholder="Titre du module"
                                                value={mod.title}
                                                onChange={e => updateModule(modIdx, 'title', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="w-full bg-transparent border-none p-0 text-sm text-gray-500 dark:text-gray-400 focus:ring-0 placeholder-gray-500"
                                                placeholder="Description du module (optionnel)"
                                                value={mod.description}
                                                onChange={e => updateModule(modIdx, 'description', e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeModule(modIdx)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-4 space-y-3">
                                        {mod.lessons.map((lesson, lessonIdx) => (
                                            <div key={lessonIdx} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${lesson.type === 'video' ? 'bg-blue-100 text-blue-600' :
                                                        lesson.type === 'live_session' ? 'bg-red-100 text-red-600' :
                                                            'bg-orange-100 text-orange-600'
                                                        }`}>
                                                        {lesson.type === 'video' ? <Video className="w-4 h-4" /> :
                                                            lesson.type === 'live_session' ? <Video className="w-4 h-4" /> :
                                                                <FileText className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            className="w-full bg-transparent border-none p-0 font-medium text-gray-900 dark:text-white focus:ring-0 text-sm"
                                                            placeholder="Titre de la leçon"
                                                            value={lesson.title}
                                                            onChange={e => updateLesson(modIdx, lessonIdx, 'title', e.target.value)}
                                                        />
                                                    </div>
                                                    <select
                                                        className="text-xs bg-transparent border-none text-gray-500 focus:ring-0"
                                                        value={lesson.type}
                                                        onChange={e => updateLesson(modIdx, lessonIdx, 'type', e.target.value)}
                                                    >
                                                        <option value="video">Vidéo</option>
                                                        <option value="pdf">PDF</option>
                                                        <option value="quiz">Quiz</option>
                                                        <option value="live_session">Classe Virtuelle</option>
                                                    </select>
                                                    <button
                                                        onClick={() => removeLesson(modIdx, lessonIdx)}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Resource Content */}
                                                <div className="pl-12">
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded text-xs"
                                                        placeholder={
                                                            lesson.type === 'video' ? "Lien vidéo (YouTube, Vimeo...)" :
                                                                lesson.type === 'live_session' ? "Lien de la réunion (Zoom, Google Meet...)" :
                                                                    "URL du document"
                                                        }
                                                        value={lesson.url}
                                                        onChange={e => updateLesson(modIdx, lessonIdx, 'url', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => addLesson(modIdx)}
                                            className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> Ajouter une leçon
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* STEP 3: REVIEW */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{formData.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">{formData.description}</p>
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <span>{formData.modules.length} Modules</span>
                                    <span>{formData.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Leçons</span>
                                    <span>{formData.price > 0 ? `${formData.price.toLocaleString()} FCFA` : 'Gratuit'}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 dark:text-white">Aperçu du programme</h4>
                                {formData.modules.map((mod, i) => (
                                    <div key={i} className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                                        <h5 className="font-medium text-gray-800 dark:text-gray-200">{mod.title}</h5>
                                        <ul className="mt-2 space-y-1">
                                            {mod.lessons.map((l, j) => (
                                                <li key={j} className="text-sm text-gray-500 flex items-center gap-2">
                                                    {l.type === 'video' ? <Video className="w-3 h-3" /> :
                                                        l.type === 'live_session' ? <Video className="w-3 h-3 text-red-500" /> :
                                                            <FileText className="w-3 h-3" />}
                                                    {l.title}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                            >
                                Retour
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(s => s + 1)}
                                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-primary-600/20"
                            >
                                Continuer
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-600/20 flex items-center gap-2"
                            >
                                {loading ? 'Création...' : (
                                    <>
                                        <Save className="w-4 h-4" /> Publier le cours
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
