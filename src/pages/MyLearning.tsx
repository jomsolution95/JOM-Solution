
import React, { useState, useEffect } from 'react';
import { BookOpen, PlayCircle, Award, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { toast } from 'react-toastify';

export const MyLearning: React.FC = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const response = await api.get('/academy/my-courses');
            setCourses(response.data.courses);
        } catch (error) {
            console.error("Failed to fetch my courses", error);
            toast.error("Impossible de charger vos cours.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon Apprentissage</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Retrouvez tous vos cours et suivez votre progression.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse h-40"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(({ enrollment, course }) => (
                            <div key={course._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col group hover:shadow-md transition-all">
                                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                                    {course.thumbnailUrl ? (
                                        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                                        {course.category}
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> Dernière activité : {new Date(enrollment.lastAccessedAt).toLocaleDateString()}
                                    </p>

                                    <div className="mt-auto">
                                        <div className="flex justify-between text-xs mb-1 font-medium text-gray-600 dark:text-gray-300">
                                            <span>Progression</span>
                                            <span>{Math.round(enrollment.progress)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
                                            <div
                                                className="bg-primary-600 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${enrollment.progress}%` }}
                                            ></div>
                                        </div>

                                        <Link
                                            to={`/learning/${course._id}`}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors group-hover:bg-primary-500"
                                        >
                                            {enrollment.progress > 0 ? 'Continuer' : 'Commencer'} <ArrowRight className="ml-2 w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {courses.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Vous n'êtes inscrit à aucun cours</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Parcourez notre catalogue pour développer de nouvelles compétences.</p>
                                <Link to="/formations" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                                    Voir les formations
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyLearning;
