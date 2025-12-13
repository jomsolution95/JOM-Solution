
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export const Partners: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
       <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <BackButton />
          <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Nos Partenaires</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Nous collaborons avec les leaders de l'industrie pour offrir les meilleures opportunités à notre communauté.
              </p>
          </div>

          {/* Logo Grid (Mock) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 opacity-70">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 grayscale hover:grayscale-0 transition-all cursor-pointer">
                      <span className="font-bold text-xl text-gray-400">PARTNER {i}</span>
                  </div>
              ))}
          </div>

          {/* Become a Partner */}
          <div className="bg-primary-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-12 flex flex-col justify-center text-white">
                      <h2 className="text-3xl font-bold mb-6">Devenez Partenaire JOM</h2>
                      <p className="text-primary-100 mb-8 text-lg">
                          Rejoignez notre réseau et accédez à un vivier de talents et d'entreprises qualifiés à travers l'Afrique.
                      </p>
                      <ul className="space-y-4 mb-8">
                          {['Visibilité accrue auprès de 10k+ pros', 'Accès prioritaire aux talents', 'Opportunités de co-branding', 'Support dédié'].map((item, i) => (
                              <li key={i} className="flex items-center gap-3">
                                  <CheckCircle2 className="w-6 h-6 text-secondary-400" />
                                  <span>{item}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-12">
                      <form className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'entreprise</label>
                              <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email professionnel</label>
                              <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                              <textarea rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"></textarea>
                          </div>
                          <button className="w-full bg-primary-600 text-white font-bold py-4 rounded-lg hover:bg-primary-700 transition-colors">
                              Envoyer la demande
                          </button>
                      </form>
                  </div>
              </div>
          </div>
       </div>
    </div>
  );
};

export default Partners;
