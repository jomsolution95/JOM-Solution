
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';
import api from '../api/client';
import { Users, Search, Mail, Award, BookOpen, MoreVertical } from 'lucide-react';
import { toast } from 'react-toastify';

interface Student {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface Enrollment {
    _id: string;
    studentId: Student;
    courseId: { _id: string; title: string };
    progress: number;
    completed: boolean;
    enrolledAt: string;
    lastAccessedAt?: string;
}

export const StudentsPage: React.FC = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const response = await api.get('/academy/students');
            setStudents(response.data.students);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors du chargement des étudiants');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.studentId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.courseId?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <BackButton />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="w-8 h-8 text-primary-600" />
                            Mes Étudiants
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Suivez la progression et gérez vos étudiants inscrits
                        </p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un étudiant..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Stats List (Optional) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Étudiants</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{students.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Taux de Complétion</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {students.length > 0
                                        ? Math.round((students.filter(s => s.completed).length / students.length) * 100)
                                        : 0}%
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Cours Suivis</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {new Set(students.map(s => s.courseId?._id)).size}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Chargement...</div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">Aucun étudiant trouvé.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Étudiant</th>
                                        <th className="px-6 py-4 font-medium">Cours</th>
                                        <th className="px-6 py-4 font-medium">Progression</th>
                                        <th className="px-6 py-4 font-medium">Date Inscription</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredStudents.map((enrollment) => (
                                        <tr key={enrollment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full bg-cover bg-center"
                                                        style={{ backgroundImage: `url(${enrollment.studentId?.avatar || 'https://ui-avatars.com/api/?name=' + enrollment.studentId?.name})` }}>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">{enrollment.studentId?.name}</div>
                                                        <div className="text-xs text-gray-500">{enrollment.studentId?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {enrollment.courseId?.title}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-32">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">{enrollment.progress}%</span>
                                                        {enrollment.completed && <Award className="w-3 h-3 text-yellow-500" />}
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${enrollment.completed ? 'bg-green-500' : 'bg-primary-600'}`}
                                                            style={{ width: `${enrollment.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="Contacter">
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentsPage;
