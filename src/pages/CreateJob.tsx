import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Save, Loader, ArrowLeft } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../api/jobs';
import { toast } from 'react-toastify';
import { AutoBroadcastToggle } from '../components/AutoBroadcastToggle';
import { BackButton } from '../components/BackButton';
import { PremiumBadge } from '../components/PremiumBadge';

const jobTypes = [
    'CDI',
    'CDD',
    'Freelance',
    'Stage',
    'Alternance',
    'Intérim',
];

export const CreateJob: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'CDI',
        location: '',
        budget: '', // Mapped to 'salary' or 'budget' in backend depending on implementation, but DTO says 'budget'
        requirements: '',
        isRemote: false,
    });

    const [autoBroadcast, setAutoBroadcast] = useState(false);

    const createMutation = useMutation({
        mutationFn: (data: any) => jobsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            toast.success('Offre d\'emploi créée avec succès !');
            navigate('/jobs');
        },
        onError: (error: any) => {
            console.error(error);
            toast.error('Erreur lors de la création de l\'offre');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            ...formData,
            requirements: formData.requirements.split('\n').filter(r => r.trim().length > 0),
            autoBroadcast,
        };

        createMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <BackButton label="Retour aux offres" onClick={() => navigate('/jobs')} />

                <div className="mt-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Publier une offre d'emploi
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Trouvez les meilleurs talents pour votre entreprise
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <form id="create-job-form" onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-primary-500" />
                                    Informations du poste
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Intitulé du poste *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Ex: Développeur Full Stack Senior"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Type de contrat *
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            required
                                        >
                                            {jobTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description du poste *
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={8}
                                            placeholder="Décrivez les responsabilités, les missions..."
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Prérequis (un par ligne)
                                        </label>
                                        <textarea
                                            value={formData.requirements}
                                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                            rows={5}
                                            placeholder="- 3 ans d'expérience&#10;- Maîtrise de React&#10;- Anglais courant"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary-500" />
                                    Lieu et Salaire
                                </h2>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Lieu *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="Ex: Dakar, Sénégal"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Salaire / Budget (FCFA)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.budget}
                                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                                placeholder="Ex: 500k - 800k"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2">
                                        <input
                                            type="checkbox"
                                            id="isRemote"
                                            checked={formData.isRemote}
                                            onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <label htmlFor="isRemote" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Ce poste est ouvert au télétravail
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Premium Toggle */}
                        <AutoBroadcastToggle
                            enabled={autoBroadcast}
                            onChange={setAutoBroadcast}
                            isPremium={true} // Assuming user is premium or can upgrade. Real app would check subscription.
                        />

                        {/* Submit Button */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm sticky top-24">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                                Résumé de la publication
                            </h3>

                            <ul className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex justify-between">
                                    <span>Statut</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">Actif</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Diffusion</span>
                                    <span className={`font-medium flex items-center gap-1 ${autoBroadcast ? 'text-primary-600' : 'text-gray-500'}`}>
                                        {autoBroadcast ? <><PremiumBadge size={14} /> Automatique</> : 'Standard'}
                                    </span>
                                </li>
                            </ul>

                            <button
                                type="submit"
                                form="create-job-form"
                                disabled={createMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors shadow-lg shadow-primary-600/20"
                            >
                                {createMutation.isPending ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Publication...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Publier l'offre
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
