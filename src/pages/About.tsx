
import React from 'react';
import { Shield, Users, Globe, Rocket, Target, Briefcase, GraduationCap, Award } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export const About: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="relative py-24 bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <div className="absolute top-4 left-4 z-20">
          <BackButton />
        </div>
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl mb-6">
            L'Écosystème Professionnel <span className="text-primary-600 block mt-2">All-in-One</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 leading-relaxed">
            JOM Solution redéfinit l'avenir du travail en Afrique. Nous connectons en un seul lieu les talents, les entreprises, et les opportunités de formation pour propulser carrières et business.
          </p>
        </div>
      </div>

      {/* Vision & Mission Section */}
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/10 text-primary-600 font-bold mb-6">
                <Rocket className="w-5 h-5 mr-2" />
                Notre Vision
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Bâtir le pont vers l'excellence</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 leading-relaxed">
                Nous croyons que le potentiel de chaque individu et de chaque entreprise ne demande qu'à être libéré. JOM Solution n'est pas seulement une plateforme, c'est un catalyseur de croissance qui simplifie l'accès au marché du travail, à la formation certifiante et aux services professionnels.
              </p>
              <div className="space-y-4">
                {[
                  "Centralisation des outils RH et Business",
                  "Validation des compétences par Blockchain",
                  "Mise en relation intelligente par IA"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-secondary-600 rounded-2xl transform rotate-3 opacity-20 filter blur-lg"></div>
              <img
                src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80"
                alt="Professionnels Afros au Bureau"
                className="relative rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pillars Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Nos 4 Piliers d'Excellence</h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Une approche holistique pour répondre à tous les défis du monde professionnel moderne.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Briefcase, title: 'Emploi & Recrutement', desc: 'Une CVthèque intelligente et des outils de recrutement avancés pour connecter les meilleurs talents aux entreprises visionnaires.' },
              { icon: GraduationCap, title: 'JOM Academy', desc: 'Une plateforme e-learning complète offrant des certifications reconnues pour une montée en compétences continue.' },
              { icon: Globe, title: 'Services & Freelance', desc: 'Un marché sécurisé permettant aux prestataires de vendre leur expertise et aux clients de trouver le partenaire idéal.' },
              { icon: Shield, title: 'Confiance & Sécurité', desc: 'Des profils vérifiés, des paiements sécurisés et un système de recommandation transparent.' },
            ].map((item, idx) => (
              <div key={idx} className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-white dark:bg-gray-900 py-20 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-12 opacity-80">Ils nous font confiance pour bâtir l'avenir</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos placeholders - using text for now to be generic but premium */}
            {['TechCorp', 'Innovate Africa', 'Global Skills', 'Future Works', 'EduTech'].map((name, i) => (
              <span key={i} className="text-2xl font-black text-gray-400 hover:text-primary-600 cursor-default">{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-primary-900 to-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center text-white relative z-10">
          {[
            { label: 'Talents Actifs', val: '15k+' },
            { label: 'Entreprises', val: '500+' },
            { label: 'Formations', val: '120+' },
            { label: 'Satisfaction', val: '99%' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">{stat.val}</div>
              <div className="text-primary-200 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
