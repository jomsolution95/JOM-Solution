
import React, { useState } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Clock, Building2, Filter, CheckCircle2, Upload, X } from 'lucide-react';
import { Job } from '../types';

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Développeur Frontend Senior (React)',
    company: 'Tech Solutions SARL',
    location: 'Dakar, Sénégal',
    type: 'CDI',
    salary: '800k - 1.2M FCFA',
    postedAt: 'Il y a 2 jours',
    logo: 'https://ui-avatars.com/api/?name=Tech+Solutions&background=0D9488&color=fff',
    description: 'Nous recherchons un développeur Frontend expérimenté pour rejoindre notre équipe dynamique. Vous serez responsable de l\'architecture et du développement de nos applications web.',
    requirements: [
      'Minimum 4 ans d\'expérience avec React et TypeScript',
      'Maîtrise de Tailwind CSS et des concepts UX/UI',
      'Expérience avec les outils de build (Vite, Webpack)',
      'Capacité à travailler en équipe agile'
    ]
  },
  {
    id: '2',
    title: 'Community Manager Bilingue',
    company: 'Global Marketing Agency',
    location: 'Abidjan, Côte d\'Ivoire',
    type: 'CDD',
    salary: '400k - 600k FCFA',
    postedAt: 'Il y a 5 heures',
    logo: 'https://ui-avatars.com/api/?name=Global+Marketing&background=blue&color=fff',
    description: 'Gérez la présence en ligne de nos clients internationaux. Vous créerez du contenu engageant et animerez nos communautés sur les réseaux sociaux.',
    requirements: [
      'Excellente maîtrise du Français et de l\'Anglais',
      'Expertise sur LinkedIn, Twitter, Instagram et TikTok',
      'Compétences en création graphique (Canva, Photoshop)',
      'Créativité et aisance relationnelle'
    ]
  },
  {
    id: '3',
    title: 'Comptable Confirmé',
    company: 'Groupe Finance Ouest',
    location: 'Dakar, Sénégal',
    type: 'CDI',
    salary: '600k - 900k FCFA',
    postedAt: 'Il y a 1 semaine',
    logo: 'https://ui-avatars.com/api/?name=Groupe+Finance&background=purple&color=fff',
    description: 'Assurez la tenue de la comptabilité générale et analytique. Vous participerez également à l\'élaboration des budgets et au reporting financier.',
    requirements: [
      'Diplôme supérieur en Comptabilité/Gestion',
      '3 ans d\'expérience minimum en cabinet ou entreprise',
      'Maîtrise du logiciel Sage et d\'Excel avancé',
      'Rigueur et sens de l\'organisation'
    ]
  },
  {
    id: '4',
    title: 'Designer UX/UI Freelance',
    company: 'Startup Innov',
    location: 'Télétravail',
    type: 'Freelance',
    salary: 'TJM 100k FCFA',
    postedAt: 'Il y a 3 jours',
    logo: 'https://ui-avatars.com/api/?name=Startup+Innov&background=orange&color=fff',
    description: 'Nous cherchons un designer créatif pour repenser l\'expérience utilisateur de notre application mobile fintech.',
    requirements: [
      'Portfolio démontrant des projets mobiles',
      'Maîtrise de Figma et du prototypage',
      'Compréhension des besoins utilisateurs',
      'Autonomie et respect des délais'
    ]
  },
  {
    id: '5',
    title: 'Stagiaire Assistant RH',
    company: 'BTP Construction',
    location: 'Douala, Cameroun',
    type: 'Stage',
    salary: '100k FCFA (Indemnité)',
    postedAt: 'Aujourd\'hui',
    logo: 'https://ui-avatars.com/api/?name=BTP+Const&background=red&color=fff',
    description: 'Assistez la DRH dans la gestion administrative du personnel et le processus de recrutement des ouvriers qualifiés.',
    requirements: [
      'Étudiant en Master RH ou Droit Social',
      'Bonne capacité rédactionnelle',
      'Discrétion et sens du service',
      'Disponibilité immédiate pour 6 mois'
    ]
  }
];

const contractTypes = ['Tous', 'CDI', 'CDD', 'Freelance', 'Stage'];

export const Jobs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [selectedJob, setSelectedJob] = useState<Job | null>(mockJobs[0]);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSent, setApplicationSent] = useState(false);

  // Mobile view state to toggle between list and details
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'Tous' || job.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setShowMobileDetails(true);
    setApplicationSent(false);
    // On mobile, scroll to top of details
    if (window.innerWidth < 1024) {
      window.scrollTo(0, 0);
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setApplicationSent(true);
      setTimeout(() => {
        setIsApplying(false);
        setApplicationSent(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filters */}
        <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offres d'emploi</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Trouvez le job qui correspond à vos ambitions.</p>
                </div>
                <button className="md:hidden px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium">
                    <Filter className="w-4 h-4 inline mr-2"/> Filtres
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Intitulé, mot-clé ou entreprise"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative w-full sm:w-64">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Ville ou Pays"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {contractTypes.map(type => (
                <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                    selectedType === type
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-500'
                    }`}
                >
                    {type}
                </button>
                ))}
            </div>
        </div>

        {/* Main Content - Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Job List */}
          <div className={`lg:col-span-5 flex flex-col gap-4 ${showMobileDetails ? 'hidden lg:flex' : 'flex'}`}>
            {filteredJobs.map(job => (
              <div 
                key={job.id}
                onClick={() => handleJobClick(job)}
                className={`bg-white dark:bg-gray-800 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  selectedJob?.id === job.id 
                    ? 'border-primary-500 ring-1 ring-primary-500' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className={`font-semibold text-base ${selectedJob?.id === job.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                        {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {job.location}</span>
                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 font-medium">
                            {job.type}
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-medium">{job.salary}</span>
                    </div>
                    <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {job.postedAt}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredJobs.length === 0 && (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Aucune offre trouvée</p>
                </div>
            )}
          </div>

          {/* Right Column: Job Details (Sticky on Desktop) */}
          <div className={`lg:col-span-7 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 lg:sticky lg:top-24 transition-all ${showMobileDetails ? 'flex fixed inset-0 z-50 lg:static overflow-y-auto' : 'hidden lg:flex'}`}>
            
            {/* Mobile Close Button */}
            {showMobileDetails && (
                <button 
                    onClick={() => setShowMobileDetails(false)} 
                    className="lg:hidden absolute top-4 left-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 z-10"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            {selectedJob ? (
                <div className="w-full flex flex-col">
                    {/* Job Header */}
                    <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700">
                         <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 mb-4 overflow-hidden">
                             <img src={selectedJob.logo} alt={selectedJob.company} className="w-full h-full object-cover" />
                         </div>
                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedJob.title}</h2>
                         <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                             <span className="flex items-center gap-1 font-medium text-gray-900 dark:text-white"><Building2 className="w-4 h-4"/> {selectedJob.company}</span>
                             <span className="hidden sm:block">•</span>
                             <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {selectedJob.location}</span>
                             <span className="hidden sm:block">•</span>
                             <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {selectedJob.type}</span>
                         </div>
                         
                         <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
                            <div className="flex items-center gap-2 text-lg font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg w-fit">
                                <DollarSign className="w-5 h-5" />
                                {selectedJob.salary}
                            </div>
                             <button 
                                onClick={() => setIsApplying(true)}
                                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-primary-500/30"
                             >
                                 Postuler Maintenant
                             </button>
                         </div>
                    </div>

                    {/* Job Body */}
                    <div className="p-6 md:p-8 flex-1">
                        <div className="prose dark:prose-invert max-w-none">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Description du poste</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                {selectedJob.description}
                            </p>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Prérequis & Compétences</h3>
                            <ul className="space-y-2 mb-6">
                                {selectedJob.requirements.map((req, index) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Avantages</h3>
                            <div className="flex flex-wrap gap-2">
                                {['Télétravail possible', 'Mutuelle santé', 'Primes de performance', 'Formation continue'].map((tag, i) => (
                                    <span key={i} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                    <Briefcase className="w-16 h-16 mb-4 opacity-50" />
                    <p>Sélectionnez une offre pour voir les détails</p>
                </div>
            )}

            {/* Application Modal Overlay */}
            {isApplying && (
                <div className="absolute inset-0 bg-white dark:bg-gray-800 z-50 flex flex-col p-6 animate-in slide-in-from-bottom-10 duration-300 rounded-xl">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Postuler chez {selectedJob?.company}</h3>
                        <button onClick={() => setIsApplying(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                     </div>

                     {applicationSent ? (
                         <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                             <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                 <CheckCircle2 className="w-10 h-10 text-green-600" />
                             </div>
                             <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Candidature Envoyée !</h3>
                             <p className="text-gray-500">Bonne chance ! L'entreprise vous contactera bientôt.</p>
                         </div>
                     ) : (
                        <form onSubmit={handleApply} className="space-y-4 max-w-lg mx-auto w-full overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                                    <input type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                                    <input type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type="email" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CV (PDF)</label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Cliquez pour uploader ou glissez votre fichier</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lettre de motivation (Optionnel)</label>
                                <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 resize-none"></textarea>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg">
                                    Envoyer ma candidature
                                </button>
                            </div>
                        </form>
                     )}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
