
import React, { useState } from 'react';
import { Search, Filter, Star, ShoppingCart } from 'lucide-react';
import { Service } from '../types';
import { Link } from 'react-router-dom';

const mockServices: Service[] = [
  {
    id: '1',
    title: 'Développement Site Web Vitrine',
    category: 'Informatique',
    price: 150000,
    providerName: 'DigitAgency',
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'Plomberie & Réparations',
    category: 'Maison',
    price: 15000,
    providerName: 'Jean Michel',
    rating: 4.5,
    reviews: 12,
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Consulting Marketing Digital',
    category: 'Marketing',
    price: 50000,
    providerName: 'Sarah Ndiaye',
    rating: 5.0,
    reviews: 8,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: 'Installation Électrique',
    category: 'Maison',
    price: 25000,
    providerName: 'ElecPro',
    rating: 4.2,
    reviews: 30,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '5',
    title: 'Cours de Cuisine Sénégalaise',
    category: 'Formation',
    price: 10000,
    providerName: 'Chef Amina',
    rating: 4.9,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '6',
    title: 'Design de Logo & Branding',
    category: 'Design',
    price: 75000,
    providerName: 'Creative Studio',
    rating: 4.7,
    reviews: 19,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315545d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const categories = ['Tous', 'Informatique', 'Maison', 'Marketing', 'Design', 'Formation'];

export const Services: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const filteredServices = mockServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trouvez le service parfait</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un service, un prestataire..."
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map(service => (
            <div key={service.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-white dark:bg-gray-900 px-2 py-1 rounded-md text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                  {service.category}
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                    <img src={`https://ui-avatars.com/api/?name=${service.providerName}&background=random`} alt="" className="w-6 h-6 rounded-full" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{service.providerName}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                  {service.title}
                </h3>
                
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-yellow-400 text-sm font-bold">
                      <Star className="h-4 w-4 fill-current mr-1" />
                      {service.rating} <span className="text-gray-400 font-normal ml-1">({service.reviews})</span>
                    </div>
                    <div className="text-gray-900 dark:text-white font-bold">
                      {service.price.toLocaleString()} FCFA
                    </div>
                  </div>
                  
                  <Link 
                    to={`/order/${service.id}`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Commander
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
            <div className="text-center py-20">
                <p className="text-gray-500 dark:text-gray-400 text-lg">Aucun service ne correspond à votre recherche.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Services;
