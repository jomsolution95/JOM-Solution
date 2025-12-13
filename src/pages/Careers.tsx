
import React from 'react';
import { Briefcase, MapPin, Clock, ChevronRight, Zap, Heart, Globe } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export const Careers: React.FC = () => {
  const openings = [
    { title: 'Senior Frontend Developer', dept: 'Engineering', type: 'Full-time', location: 'Dakar / Remote' },
    { title: 'Product Manager', dept: 'Product', type: 'Full-time', location: 'Abidjan' },
    { title: 'Customer Success Specialist', dept: 'Support', type: 'Full-time', location: 'Remote' },
    { title: 'Sales Manager West Africa', dept: 'Sales', type: 'Full-time', location: 'Lagos' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 py-20 border-b border-gray-200 dark:border-gray-700 relative">
        <div className="absolute top-4 left-4">
            <BackButton />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Rejoignez l'aventure JOM</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Nous construisons le futur du travail en Afrique. Venez bâtir quelque chose d'extraordinaire avec nous.
          </p>
          <button className="mt-8 bg-primary-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors">
            Voir les postes ouverts
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 text-center">Pourquoi nous rejoindre ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: 'Impact Rapide', desc: 'Vos idées sont écoutées et mises en œuvre rapidement. Pas de bureaucratie inutile.' },
            { icon: Heart, title: 'Bien-être', desc: 'Mutuelle santé complète, horaires flexibles et culture du télétravail.' },
            { icon: Globe, title: 'Ambition Globale', desc: 'Travaillez sur des défis techniques et humains à l\'échelle continentale.' },
          ].map((benefit, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <benefit.icon className="w-8 h-8 text-primary-500 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Openings */}
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Postes ouverts</h2>
        <div className="space-y-4">
          {openings.map((job, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-primary-500 group">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.dept}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.type}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Careers;
