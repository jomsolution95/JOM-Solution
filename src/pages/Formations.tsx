
import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Users, Clock, BookOpen, GraduationCap, Loader, X, PlayCircle, CheckCircle } from 'lucide-react';
import { Training } from '../types';
import api from '../api/client';
import { toast } from 'react-toastify';
import { TRAINING_CATEGORIES } from '../constants/categories';
import { useParams, useNavigate } from 'react-router-dom';

const categories = ['Tous', ...TRAINING_CATEGORIES];

export const Formations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  useEffect(() => {
    fetchTrainings();
  }, [selectedCategory]);

  useEffect(() => {
    if (id && trainings.length > 0) {
      const found = trainings.find(t => t._id === id || t.id === id);
      if (found) {
        setSelectedTraining(found);
      } else {
        // Fetch individual if not in list
        fetchOneTraining(id);
      }
    }
  }, [id, trainings]);

  const fetchOneTraining = async (trainingId: string) => {
    try {
      const response = await api.get(`/academy/courses/${trainingId}`);
      const t = response.data.course;
      const formatted: Training = {
        ...t,
        id: t._id,
        institution: t.institutionId?.name || 'Institution',
        image: t.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        students: t.enrolledStudents?.length || 0,
        reviews: 0,
        rating: 0, // Backend might not have ratings yet
        duration: t.duration ? `${t.duration}h` : 'Non défini'
      };
      setSelectedTraining(formatted);
    } catch (error) {
      console.error("Failed to fetch training", error);
    }
  };

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== 'Tous') params.category = selectedCategory;

      const response = await api.get('/academy/catalog', { params });
      const data = response.data.courses || [];

      const formattedTrainings = data.map((t: any) => ({
        ...t,
        id: t._id,
        institution: t.institutionId?.name || 'Institution',
        image: t.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        students: t.enrolledStudents?.length || 0,
        reviews: 0, // Mock for now if not in backend response
        rating: 0,
        duration: t.duration ? `${t.duration}h` : 'Non défini'
      }));

      setTrainings(formattedTrainings);
    } catch (error) {
      console.error("Failed to fetch trainings", error);
      toast.error("Impossible de charger le catalogue.");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for search text
  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.institution.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header & Search */}
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Formations Certifiantes</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Développez vos compétences avec les meilleures institutions.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher une formation, une école..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader className="w-10 h-10 text-primary-600 animate-spin" />
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrainings.map(training => (
              <div
                key={training.id || training._id}
                onClick={() => {
                  navigate(`/formations/${training.id || training._id}`);
                  setSelectedTraining(training);
                }}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={training.image} alt={training.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-600 dark:text-primary-400 shadow-sm flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {training.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
                    <GraduationCap className="w-4 h-4" />
                    <span className="font-medium">{training.institution}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-primary-500 transition-colors line-clamp-2">
                    {training.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
                      <Users className="w-3 h-3" />
                      {training.students.toLocaleString()} étudiants
                    </div>
                    {training.level && (
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
                        <span className={`w-2 h-2 rounded-full ${training.level === 'Débutant' ? 'bg-green-500' :
                          training.level === 'Intermédiaire' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                        {training.level}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">Prix</span>
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {training.price > 0 ? `${training.price.toLocaleString()} FCFA` : 'Gratuit'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredTrainings.length === 0 && (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucune formation trouvée</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Essayez de modifier vos critères de recherche.</p>
          </div>
        )}

        {/* Detail Modal / Overlay */}
        {selectedTraining && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative animate-in zoom-in duration-200">
              <button
                onClick={() => {
                  setSelectedTraining(null);
                  navigate('/formations');
                }}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full z-10 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="h-64 md:h-80 relative">
                <img src={selectedTraining.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                  <div>
                    <div className="flex gap-2 mb-3">
                      <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{selectedTraining.category}</span>
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{selectedTraining.level}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedTraining.title}</h2>
                    <p className="text-gray-200 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" /> {selectedTraining.institution}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold dark:text-white mb-3">À propos de ce cours</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {selectedTraining.description || "Aucune description disponible pour ce cours."}
                    </p>
                  </div>

                  {/* Syllabus/Modules Placeholder */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6">
                    <h3 className="text-lg font-bold dark:text-white mb-4">Programme de la formation</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                        <PlayCircle className="w-5 h-5 text-primary-600" />
                        <span className="text-gray-700 dark:text-gray-200 font-medium">Introduction au cours</span>
                        <span className="ml-auto text-xs text-gray-400">10 min</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 opacity-70">
                        <CheckCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-200 font-medium">Modules (Contenu réservé aux inscrits)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                      {selectedTraining.price > 0 ? `${selectedTraining.price.toLocaleString()} FCFA` : 'Gratuit'}
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Accès illimité à vie</p>

                    <button className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 transition-transform active:scale-95 mb-3">
                      S'inscrire maintenant
                    </button>
                    <p className="text-xs text-center text-gray-400">Garantie satisfait ou remboursé de 30 jours</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Durée</span>
                      <span className="font-semibold dark:text-white text-sm">{selectedTraining.duration}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Niveau</span>
                      <span className="font-semibold dark:text-white text-sm">{selectedTraining.level}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Certificat</span>
                      <span className="font-semibold dark:text-white text-sm">Oui</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Formations;
