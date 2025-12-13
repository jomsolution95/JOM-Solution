
import React from 'react';
import { Shield, Users, Globe, Rocket, Heart, Target } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export const About: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="relative py-24 bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <div className="absolute top-4 left-4 z-20">
            <BackButton />
        </div>
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Notre Mission : <span className="text-primary-600">Connecter l'Afrique</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-300">
            JOM Solution est né d'une vision simple : créer un écosystème numérique où le talent rencontre l'opportunité, sans barrières.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Nos Valeurs Fondamentales</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Ce qui nous guide au quotidien pour bâtir l'avenir.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Confiance', desc: 'Nous bâtissons des relations durables basées sur la transparence et la sécurité des échanges.' },
              { icon: Rocket, title: 'Innovation', desc: 'Nous repoussons les limites de la technologie pour offrir des solutions adaptées aux réalités locales.' },
              { icon: Heart, title: 'Impact', desc: 'Chaque fonctionnalité est pensée pour créer de la valeur réelle pour nos communautés.' },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-12">L'Équipe JOM</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Seynabou Diallo', role: 'CEO & Fondatrice', img: 'https://ui-avatars.com/api/?name=Seynabou+Diallo&background=0D9488&color=fff' },
              { name: 'Moussa Konaté', role: 'CTO', img: 'https://ui-avatars.com/api/?name=Moussa+Konate&background=random' },
              { name: 'Sarah Johnson', role: 'Head of Growth', img: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random' },
              { name: 'David Mensah', role: 'Lead Product', img: 'https://ui-avatars.com/api/?name=David+Mensah&background=random' },
            ].map((member, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-center p-6">
                <img src={member.img} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-gray-50 dark:border-gray-800" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-primary-600 mb-4">{member.role}</p>
                <div className="flex justify-center space-x-3 opacity-60">
                  {/* Social placeholders */}
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="bg-primary-900 py-16">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
                <div className="text-4xl font-bold mb-2">10k+</div>
                <div className="text-primary-200">Utilisateurs</div>
            </div>
            <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-primary-200">Entreprises</div>
            </div>
            <div>
                <div className="text-4xl font-bold mb-2">15k</div>
                <div className="text-primary-200">Services rendus</div>
            </div>
            <div>
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-primary-200">Satisfaction</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default About;
