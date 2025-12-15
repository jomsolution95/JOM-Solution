
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';
import api from '../api/client';
import { toast } from 'react-toastify';
import { Mail, Zap, Send, Rocket, CheckCircle2, Megaphone } from 'lucide-react';

export const MarketingPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'email' | 'boost'>('email');
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Email state
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            // Assuming we have an endpoint to list "my courses"
            const res = await api.get('/academy/courses'); // This usually returns student view. We might need specific institution view.
            // Re-using the same endpoint if it returns owned courses for institution.
            // Or use the one from Dashboard stats if available. 
            // Let's assume /academy/courses returns *created* courses for an institution role.
            setCourses(res.data.courses || []);
        } catch (error) {
            console.error(error);
            toast.error("Impossible de charger vos cours.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!emailSubject || !emailMessage) {
            toast.error("Veuillez remplir le sujet et le message.");
            return;
        }

        setSending(true);
        try {
            const res = await api.post('/academy/marketing/broadcast', {
                courseId: selectedCourse || undefined,
                subject: emailSubject,
                message: emailMessage
            });
            toast.success(res.data.message);
            setEmailSubject('');
            setEmailMessage('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erreur lors de l'envoi.");
        } finally {
            setSending(false);
        }
    };

    const handleBoost = async (courseId: string) => {
        if (!window.confirm("Voulez-vous mettre en avant ce cours pour 30 jours ? (Inclus dans votre offre Premium)")) return;

        try {
            const res = await api.post(`/academy/marketing/boost/${courseId}`);
            toast.success(res.data.message);
            // Update local state
            setCourses(prev => prev.map(c => c._id === courseId ? { ...c, isFeatured: true, featuredExpiresAt: res.data.expiresAt } : c));
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erreur lors du boost.");
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4">
                <BackButton />

                <div className="mt-4 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Megaphone className="w-8 h-8 text-primary-600" />
                        Marketing & Promotion
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Boostez la visibilité de vos cours et engagez vos étudiants.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-8 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`pb-4 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'email'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <Mail className="w-4 h-4" /> Campagnes Emailing
                    </button>
                    <button
                        onClick={() => setActiveTab('boost')}
                        className={`pb-4 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'boost'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <Zap className="w-4 h-4" /> Mise en Avant (Boost)
                    </button>
                </div>

                {/* EMAIL TAB */}
                {activeTab === 'email' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="max-w-2xl">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Envoyer une annonce</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cible</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                    >
                                        <option value="">Tous les étudiants inscrits (Toutes formations)</option>
                                        {courses.map(c => (
                                            <option key={c._id} value={c._id}>Étudiants de : {c.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sujet</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        placeholder="Ex: Nouvelle leçon disponible !"
                                        value={emailSubject}
                                        onChange={e => setEmailSubject(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                                    <textarea
                                        rows={6}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        placeholder="Votre message ici..."
                                        value={emailMessage}
                                        onChange={e => setEmailMessage(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Le message sera envoyé au nom de votre établissement.</p>
                                </div>

                                <button
                                    onClick={handleSendEmail}
                                    disabled={sending}
                                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {sending ? 'Envoi en cours...' : (
                                        <>
                                            <Send className="w-4 h-4" /> Envoyer la campagne
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOOST TAB */}
                {activeTab === 'boost' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? <div className="text-center py-8">Chargement...</div> : courses.map(course => (
                            <div key={course._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                                <div className="h-40 bg-gray-200 bg-cover bg-center relative" style={{ backgroundImage: `url(${course.thumbnailUrl || 'https://via.placeholder.com/400'})` }}>
                                    {course.isFeatured && (
                                        <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                            <Rocket className="w-3 h-3" /> MIS EN AVANT
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{course.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <span>{course.category}</span>
                                        <span>•</span>
                                        <span>{course.modules?.length || 0} Modules</span>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                        {course.isFeatured ? (
                                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                                <CheckCircle2 className="w-5 h-5" />
                                                Actif jusqu'au {new Date(course.featuredExpiresAt).toLocaleDateString()}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleBoost(course._id)}
                                                className="w-full py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                            >
                                                <Rocket className="w-4 h-4" /> Booster ce cours
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};
