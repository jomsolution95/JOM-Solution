import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Video, FileText, HelpCircle, Users, BarChart3,
    Edit, Trash2, Eye, Upload, Save, X, Play, BookOpen
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client';
import { BackButton } from '../components/BackButton';

interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    published: boolean;
    enrolledStudents: string[];
    modules: Module[];
    createdAt: string;
}

interface Module {
    _id: string;
    title: string;
    description: string;
    order: number;
    content: Content[];
    duration: number;
}

interface Content {
    _id: string;
    title: string;
    type: 'video' | 'pdf' | 'quiz' | 'text';
    url?: string;
    content?: string;
    questions?: QuizQuestion[];
    order: number;
    duration?: number;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export const AcademyAdmin: React.FC = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [showContentModal, setShowContentModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [uploading, setUploading] = useState(false);

    // Form states
    const [courseForm, setCourseForm] = useState({
        title: '',
        description: '',
        category: '',
        level: 'beginner',
    });

    const [moduleForm, setModuleForm] = useState({
        title: '',
        description: '',
        order: 1,
    });

    const [contentForm, setContentForm] = useState({
        title: '',
        type: 'video' as 'video' | 'pdf' | 'quiz' | 'text',
        url: '',
        content: '',
        order: 1,
        duration: 0,
    });

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const response = await api.get('/academy/courses');
            setCourses(response.data.courses);
        } catch (error: any) {
            if (error.response?.status === 403) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Erreur lors du chargement des cours');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async () => {
        try {
            await api.post('/academy/courses', courseForm);
            toast.success('Cours créé avec succès');
            setShowCourseModal(false);
            setCourseForm({ title: '', description: '', category: '', level: 'beginner' });
            loadCourses();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors de la création');
        }
    };

    const handleAddModule = async () => {
        if (!selectedCourse) return;

        try {
            await api.post(`/academy/courses/${selectedCourse._id}/modules`, moduleForm);
            toast.success('Module ajouté');
            setShowModuleModal(false);
            setModuleForm({ title: '', description: '', order: 1 });
            loadCourses();
        } catch (error) {
            toast.error('Erreur lors de l\'ajout du module');
        }
    };

    const handleFileUpload = async (file: File, type: 'video' | 'pdf') => {
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await api.post(`/academy/upload/${type}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setContentForm({ ...contentForm, url: response.data.url });
            toast.success(`${type === 'video' ? 'Vidéo' : 'PDF'} uploadé avec succès`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'upload');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

        try {
            await api.delete(`/academy/courses/${courseId}`);
            toast.success('Cours supprimé');
            loadCourses();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handlePublishCourse = async (courseId: string, published: boolean) => {
        try {
            await api.put(`/academy/courses/${courseId}`, { published: !published });
            toast.success(published ? 'Cours dépublié' : 'Cours publié');
            loadCourses();
        } catch (error) {
            toast.error('Erreur lors de la publication');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton label="Retour" />

                {/* Header */}
                <div className="mt-6 mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-primary-600" />
                            Gestion des Formations
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Créez et gérez vos cours en ligne
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCourseModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Nouveau Cours
                    </button>
                </div>

                {/* Course Limit Warning */}
                <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Plan Gratuit : {courses.length}/5 cours créés
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                Passez à Premium pour un hébergement illimité
                            </p>
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course._id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
                        >
                            {/* Thumbnail */}
                            <div className="h-48 bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <BookOpen className="w-16 h-16 text-white opacity-50" />
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {course.title}
                                    </h3>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-bold ${course.published
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                                            }`}
                                    >
                                        {course.published ? 'Publié' : 'Brouillon'}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {course.description}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {course.enrolledStudents?.length || 0}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Video className="w-4 h-4" />
                                        {course.modules?.length || 0} modules
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedCourse(course);
                                            setShowModuleModal(true);
                                        }}
                                        className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Module
                                    </button>
                                    <button
                                        onClick={() => handlePublishCourse(course._id, course.published)}
                                        className="p-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/academy/courses/${course._id}`)}
                                        className="p-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCourse(course._id)}
                                        className="p-2 border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {!loading && courses.length === 0 && (
                    <div className="text-center py-20">
                        <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Aucun cours créé
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Commencez par créer votre premier cours
                        </p>
                        <button
                            onClick={() => setShowCourseModal(true)}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors"
                        >
                            Créer un cours
                        </button>
                    </div>
                )}

                {/* Create Course Modal */}
                {showCourseModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Nouveau Cours
                                </h3>
                                <button
                                    onClick={() => setShowCourseModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Titre
                                    </label>
                                    <input
                                        type="text"
                                        value={courseForm.title}
                                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={courseForm.description}
                                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCourseModal(false)}
                                        className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleCreateCourse}
                                        className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg"
                                    >
                                        Créer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Module Modal */}
                {showModuleModal && selectedCourse && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Ajouter un Module
                                </h3>
                                <button
                                    onClick={() => setShowModuleModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Titre du module
                                    </label>
                                    <input
                                        type="text"
                                        value={moduleForm.title}
                                        onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={moduleForm.description}
                                        onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowModuleModal(false)}
                                        className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleAddModule}
                                        className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg"
                                    >
                                        Ajouter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcademyAdmin;
