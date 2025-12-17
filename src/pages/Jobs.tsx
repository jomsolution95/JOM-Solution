import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, DollarSign, Clock, Filter, ChevronRight, Building, CheckCircle, AlertCircle, X, FileText, Send, Loader } from 'lucide-react';
import { jobsApi } from '../api/jobs';
import { cvApi, CVData } from '../api/cv';
import { Job } from '../types';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';


const JobSearchPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Application Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [userCVs, setUserCVs] = useState<CVData[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [selectedCVId, setSelectedCVId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Fetch Jobs
  useEffect(() => {
    fetchJobs();
  }, [selectedType]); // Re-fetch when major filters change, or use memoized filter

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedType !== 'Tous') params.type = selectedType;

      const data = await jobsApi.getAll(params);
      const jobList = Array.isArray(data) ? data : (data.data || []);
      setJobs(jobList);

      // Handle deep linking or default selection
      if (id) {
        // Try to find in list first
        const found = jobList.find((j: Job) => j._id === id || j.id === id);
        if (found) {
          setSelectedJob(found);
        } else {
          // Fetch individually if not in list
          try {
            const specificJob = await jobsApi.getOne(id);
            if (specificJob) {
              setSelectedJob(specificJob);
              // Optionally add to list if not present
              setJobs(prev => [specificJob, ...prev]);
            }
          } catch (e) {
            console.error("Failed to fetch specific job", e);
            if (jobList.length > 0) setSelectedJob(jobList[0]);
          }
        }
      } else if (jobList.length > 0 && !selectedJob) {
        setSelectedJob(jobList[0]);
      }
    } catch (error) {
      console.error("Error loading jobs", error);
      toast.error("Erreur lors du chargement des offres.");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for search term/location if backend search is separate
  // Ideally use backend search, but for hybrid approach:
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = !selectedLocation || job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  const handleApplyClick = async (job: Job) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowApplyModal(true);
    setLoadingCVs(true);
    try {
      const cvs = await cvApi.getAll();
      setUserCVs(cvs);
      if (cvs.length > 0) setSelectedCVId(cvs[0]._id || '');
    } catch (error) {
      console.error("Error loading CVs", error);
      toast.error("Impossible de charger vos CVs.");
    } finally {
      setLoadingCVs(false);
    }
  };

  const submitApplication = async () => {
    if (!selectedJob || !selectedCVId) return;

    setIsApplying(true);
    try {
      await jobsApi.apply(selectedJob.id || selectedJob._id, { // Handle id vs _id inconsistency
        cvId: selectedCVId,
        coverLetter
      });
      toast.success("Candidature envoyée avec succès !");
      setShowApplyModal(false);
      setCoverLetter('');
    } catch (error: any) {
      console.error("Apply error", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi de la candidature.");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader className="w-10 h-10 text-primary-600 animate-spin" />
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header / Search Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un poste, une entreprise, un mot-clé..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ville, Région"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none appearance-none dark:text-white"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="Tous">Tous les types</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Freelance">Freelance</option>
                <option value="Stage">Stage</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-180px)]">

          {/* Job List */}
          <div className="w-full lg:w-1/3 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {filteredJobs.length} offres trouvées
              </h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                <Filter className="w-4 h-4" /> Filtres
              </button>
            </div>

            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <div
                  key={job.id || job._id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedJob && (selectedJob.id === job.id || selectedJob._id === job._id)
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 ring-1 ring-primary-500'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{job.title}</h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 whitespace-nowrap ml-2">
                      {job.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1">
                    <Building className="w-3 h-3" /> {job.company}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      <DollarSign className="w-3 h-3" /> {job.salary}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    Publié le {new Date(job.postedAt || job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {filteredJobs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p>Aucune offre ne correspond à vos critères.</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Details */}
          <div className="hidden lg:block w-full lg:w-2/3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full shadow-sm">
            {selectedJob ? (
              <>
                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 p-2 flex items-center justify-center">
                        {selectedJob.logo ? (
                          <img src={selectedJob.logo} alt={selectedJob.company} className="w-full h-full object-contain" />
                        ) : (
                          <Building className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedJob.title}</h1>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <span className="font-medium">{selectedJob.company}</span>
                          <span>•</span>
                          <span className="text-sm">{selectedJob.location}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApplyClick(selectedJob)}
                      className="bg-primary-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Postuler
                    </button>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800">
                      <Briefcase className="w-4 h-4" /> {selectedJob.type}
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-800">
                      <DollarSign className="w-4 h-4" /> {selectedJob.salary}
                    </div>
                    <div className="flex items-center gap-2 text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-lg border border-orange-100 dark:border-orange-800">
                      <Clock className="w-4 h-4" /> {new Date(selectedJob.postedAt || selectedJob.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">À propos du poste</h3>
                    <div className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 mb-8 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      {selectedJob.description}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Prérequis</h3>
                    {selectedJob.requirements && selectedJob.requirements.length > 0 ? (
                      <ul className="space-y-2 mb-8">
                        {selectedJob.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic mb-8">Aucun prérequis spécifié.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                <Briefcase className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2">Sélectionnez une offre</h3>
                <p>Cliquez sur une offre d'emploi à gauche pour voir les détails et postuler.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white">Postuler à {selectedJob?.title}</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>

            {loadingCVs ? (
              <div className="py-8 text-center"><Loader className="w-8 h-8 animate-spin mx-auto text-primary-600" /></div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sélectionnez votre CV</label>
                  {userCVs.length > 0 ? (
                    <div className="grid gap-2">
                      {userCVs.map(cv => (
                        <div
                          key={cv._id}
                          onClick={() => setSelectedCVId(cv._id || '')}
                          className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 ${selectedCVId === cv._id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                          <FileText className={`w-5 h-5 ${selectedCVId === cv._id ? 'text-primary-600' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <div className="font-medium dark:text-white">{cv.title}</div>
                            <div className="text-xs text-gray-500">Modifié le {new Date(cv.updatedAt || new Date()).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                      <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                      Vous n'avez pas encore de CV. <button onClick={() => navigate('/cv-builder')} className="underline font-bold">Créez-en un maintenant</button>.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lettre de motivation (Optionnel)</label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-32 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Expliquez pourquoi vous êtes le meilleur candidat..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowApplyModal(false)} className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">Annuler</button>
                  <button
                    onClick={submitApplication}
                    disabled={!selectedCVId || isApplying}
                    className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    {isApplying ? <Loader className="w-5 h-5 animate-spin" /> : 'Envoyer ma candidature'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSearchPage;
