
import React, { useState } from 'react';
import { Search, Filter, Star, Users, Clock, BookOpen, GraduationCap } from 'lucide-react';
import { Training } from '../types';

const mockTrainings: Training[] = [
  {
    id: '1',
    title: 'Développement Web Fullstack : De Zéro à Héros',
    institution: 'Tech Academy Dakar',
    category: 'Informatique',
    price: 250000,
    duration: '6 mois',
    students: 1240,
    rating: 4.9,
    reviews: 320,
    level: 'Débutant',
    image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'Entrepreneuriat Agricole Durable',
    institution: 'AgriBusiness Institute',
    category: 'Agriculture',
    price: 75000,
    duration: '3 mois',
    students: 850,
    rating: 4.7,
    reviews: 150,
    level: 'Intermédiaire',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Marketing Digital & Réseaux Sociaux',
    institution: 'Digital Skills Africa',
    category: 'Marketing',
    price: 50000,
    duration: '6 semaines',
    students: 2100,
    rating: 4.8,
    reviews: 412,
    level: 'Débutant',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: 'Gestion Financière pour PME',
    institution: 'École de Commerce de l\'Ouest',
    category: 'Business',
    price: 120000,
    duration: '2 mois',
    students: 430,
    rating: 4.6,
    reviews: 89,
    level: 'Avancé',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '5',
    title: 'Design Graphique & UX/UI',
    institution: 'Creative Hub',
    category: 'Design',
    price: 90000,
    duration: '4 mois',
    students: 670,
    rating: 4.9,
    reviews: 210,
    level: 'Intermédiaire',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '6',
    title: 'Leadership et Gestion d\'Équipe',
    institution: 'Leadership Center',
    category: 'Business',
    price: 60000,
    duration: '1 mois',
    students: 320,
    rating: 4.5,
    reviews: 65,
    level: 'Avancé',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const categories = ['Tous', 'Informatique', 'Agriculture', 'Marketing', 'Business', 'Design'];

export const Formations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const filteredTrainings = mockTrainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          training.institution.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || training.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
            <button className="flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm">
              <Filter className="h-5 w-5 mr-2" />
              Filtres
            </button>
          </div>
          
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrainings.map(training => (
            <div key={training.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col">
              <div className="relative h-52 overflow-hidden">
                <img src={training.image} alt={training.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-600 dark:text-primary-400 shadow-sm flex items-center gap-1">
                   <BookOpen className="w-3 h-3" />
                   {training.category}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {training.duration}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
                    <GraduationCap className="w-4 h-4" />
                    <span className="font-medium">{training.institution}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-primary-500 transition-colors">
                  {training.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
                        <Users className="w-3 h-3" />
                        {training.students.toLocaleString()} étudiants
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
                        <span className={`w-2 h-2 rounded-full ${
                            training.level === 'Débutant' ? 'bg-green-500' : 
                            training.level === 'Intermédiaire' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></span>
                        {training.level}
                    </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex flex-col">
                      <span className="text-xs text-gray-400">Prix</span>
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {training.price.toLocaleString()} FCFA
                      </span>
                  </div>
                  <div className="flex flex-col items-end">
                       <div className="flex items-center text-yellow-400 text-sm font-bold">
                            <Star className="h-4 w-4 fill-current mr-1" />
                            {training.rating}
                        </div>
                        <span className="text-xs text-gray-400">{training.reviews} avis</span>
                  </div>
                </div>

                <button className="w-full mt-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 font-medium rounded-lg transition-colors text-sm border border-gray-200 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-700">
                    Voir le programme
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTrainings.length === 0 && (
            <div className="text-center py-20">
                <GraduationCap className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucune formation trouvée</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Essayez de modifier vos critères de recherche.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Formations;
