
import React, { useState } from 'react';
import { Check, Crown, Star, Shield, Zap, BarChart, Users, Heart, Briefcase, Megaphone, Mail, Layout, Target, MousePointer2, Bell, GraduationCap, Cloud, Sparkles, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { BackButton } from '../components/BackButton';

// --- DATA MODELS ---

interface PlanFeature {
    text: string;
    included: boolean;
    highlight?: boolean;
}

interface Plan {
    id: string;
    role: UserRole;
    name: string;
    price: number;
    period: string;
    description: string;
    features: PlanFeature[];
    icon: React.ElementType;
    color: string;
    popular?: boolean;
}

// --- SUBSCRIPTION PLANS (SaaS) ---

const plans: Plan[] = [
    {
        id: 'individual-pro',
        role: 'individual',
        name: 'Jom+ Talent',
        price: 4900,
        period: '/mois',
        description: 'Boostez votre carrière et soyez visible par les recruteurs.',
        icon: Crown,
        color: 'from-blue-500 to-cyan-500',
        features: [
            { text: 'Badge "Talent Vérifié" (Confiance)', included: true },
            { text: 'Remontée en tête de CVthèque', included: true, highlight: true },
            { text: 'Accès prioritaire aux offres (-24h)', included: true },
            { text: 'Statistiques de vues de profil', included: true },
            { text: 'Accès illimité aux formations', included: true },
        ]
    },
    {
        id: 'company-biz',
        role: 'company',
        name: 'Jom Recruteur Pro',
        price: 29900,
        period: '/mois',
        description: 'La suite complète pour recruter les meilleurs talents.',
        icon: Briefcase,
        color: 'from-purple-600 to-indigo-600',
        popular: true,
        features: [
            { text: 'Badge "Entreprise Vérifiée"', included: true },
            { text: 'ATS Intégré (Suivi candidats)', included: true, highlight: true },
            { text: 'Accès CVthèque (50 profils/mois)', included: true, highlight: true },
            { text: '10 Annonces d\'emploi incluses', included: true },
            { text: 'Page Entreprise Premium (SEO)', included: true },
            { text: 'Multi-diffusion automatique', included: true },
        ]
    },
    {
        id: 'school-edu',
        role: 'etablissement',
        name: 'Jom Academy',
        price: 49900,
        period: '/mois',
        description: 'Digitalisez votre établissement et vos certifications.',
        icon: Users,
        color: 'from-emerald-500 to-teal-500',
        features: [
            { text: 'Hébergement de cours illimité', included: true },
            { text: 'Génération de Certificats JOM', included: true, highlight: true },
            { text: 'Classes virtuelles intégrées', included: true },
            { text: 'CRM Étudiants & Suivi', included: true },
            { text: 'Marketing ciblé vers les étudiants', included: true },
        ]
    },

];

// --- ON-DEMAND CONFIGURATIONS ---

const recruitmentPacks = [
    { count: 1, price: 5000, label: 'Unitaire' },
    { count: 5, price: 20000, label: 'Pack Startup', save: '-20%' },
    { count: 20, price: 70000, label: 'Pack Croissance', save: '-30%', popular: true },
    { count: 50, price: 150000, label: 'Pack Corporate', save: '-40%' },
];

const BOOSTS_BY_ROLE = {
    individual: [
        { title: 'Profil Star', price: 2000, duration: '7 jours', icon: Star, desc: 'Apparaissez en tête des recherches de talents.' },
        { title: 'Badge Urgent', price: 1000, duration: '14 jours', icon: Zap, desc: 'Signalez que vous êtes disponible immédiatement.' },
        { title: 'Relance Candidature', price: 500, duration: '1 envoi', icon: Bell, desc: 'Remontez votre CV en haut de la pile recruteur.' },
    ],
    company: [
        { title: 'Annonce à la Une', price: 5000, duration: '7 jours', icon: Star, desc: 'Votre offre épinglée en haut des résultats.' },
        { title: 'Badge Urgent', price: 2000, duration: '14 jours', icon: Zap, desc: 'Attirez l\'attention sur un recrutement critique.' },
        { title: 'Push Notification', price: 15000, duration: '1 envoi', icon: Bell, desc: 'Alerte envoyée aux profils correspondants.' },
    ],
    etablissement: [
        { title: 'Formation à la Une', price: 10000, duration: '15 jours', icon: GraduationCap, desc: 'Mettez en avant un programme spécifique.' },
        { title: 'Portes Ouvertes', price: 5000, duration: '7 jours', icon: Megaphone, desc: 'Promotion d\'événement auprès des étudiants.' },
        { title: 'Emailing Ciblé', price: 20000, duration: '1 envoi', icon: Mail, desc: 'Message direct aux profils intéressés.' },
    ],

};

const advertisingSolutions = [
    { title: 'Display Bannière', price: 'CPM', icon: Layout, desc: 'Bannières publicitaires sur le fil d\'actualité et pages de recherche.' },
    { title: 'Emailing Sponsorisé', price: 'CPL', icon: Mail, desc: 'Insertion dans notre newsletter hebdomadaire (10k+ abonnés).' },
    { title: 'Article Sponsorisé', price: 'Forfait', icon: Megaphone, desc: 'Article de blog dédié mettant en avant votre marque employeur.' },
];

export const Premium: React.FC = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<'subscription' | 'ondemand'>('subscription');
    const [activeTabRole, setActiveTabRole] = useState<UserRole>(user?.role || 'company');

    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Determine current active role context
    const currentRole = user ? user.role : activeTabRole;

    // Filter plan to display
    const displayPlan = plans.find(p => p.role === currentRole);

    // Get boosts for current role (fallback to company if undefined)
    const currentBoosts = BOOSTS_BY_ROLE[currentRole as keyof typeof BOOSTS_BY_ROLE] || BOOSTS_BY_ROLE.company;

    const getPrice = (basePrice: number) => {
        if (billingCycle === 'yearly') {
            // Apply 20% discount on the total
            // Monthly equivalent = (Price * 12 * 0.8) / 12 = Price * 0.8
            return Math.round(basePrice * 0.8);
        }
        return basePrice;
    };

    const handleSubscribe = () => {
        if (!displayPlan) return;
        navigate('/premium/checkout', {
            state: {
                selectedPlanId: displayPlan.id,
                billingCycle
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton label="Retour" />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-200 dark:border-primary-800 rounded-full px-4 py-1 mb-4">
                        <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Solutions Business & Carrière</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl lg:text-6xl mb-4">
                        Investissez dans votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">Croissance</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                        Des outils puissants pour recruter, vendre et se former. Choisissez l'offre adaptée à vos ambitions.
                    </p>
                </div>

                {/* Role Tabs if not logged in (Applies to both views) */}
                {!user && (
                    <div className="flex justify-center flex-wrap gap-2 mb-8">
                        {plans.map((plan) => (
                            <button
                                key={plan.role}
                                onClick={() => setActiveTabRole(plan.role)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${activeTabRole === plan.role
                                    ? 'bg-white dark:bg-gray-800 border-primary-500 text-primary-600 shadow-sm ring-1 ring-primary-500'
                                    : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {plan.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Mode Toggles */}
                <div className="flex flex-col items-center gap-6 mb-12">
                    {/* View Mode (SaaS / OnDemand) */}
                    <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm inline-flex">
                        <button
                            onClick={() => setViewMode('subscription')}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'subscription'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Crown className="w-4 h-4" /> Abonnements (SaaS)
                        </button>
                        <button
                            onClick={() => setViewMode('ondemand')}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'ondemand'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Target className="w-4 h-4" /> À la carte & Pubs
                        </button>
                    </div>

                    {/* Billing Cycle Toggle (Only for Subscription) */}
                    <div className={`transition-opacity duration-300 ${viewMode === 'subscription' ? 'opacity-100' : 'opacity-0 pointer-events-none h-0'}`}>
                        <div className="relative inline-flex bg-gray-100 dark:bg-gray-700 rounded-full p-1 cursor-pointer">
                            <div className="absolute -top-3 -right-3">
                                <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                                    -20%
                                </span>
                            </div>
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                Mensuel
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'yearly'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                Annuel
                            </button>
                        </div>
                    </div>
                </div>

                {viewMode === 'subscription' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Subscription Card */}
                        {displayPlan && (
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row">
                                    {/* Left: Pricing & Info */}
                                    <div className="md:w-2/5 p-8 bg-gray-50 dark:bg-gray-900/50 flex flex-col justify-center text-center relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${displayPlan.color}`}></div>
                                        {displayPlan.popular && (
                                            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                Populaire
                                            </div>
                                        )}
                                        <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${displayPlan.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg rotate-3`}>
                                            <displayPlan.icon className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{displayPlan.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{displayPlan.description}</p>

                                        <div className="mb-8 relative">
                                            {billingCycle === 'yearly' && (
                                                <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-green-500 font-bold">
                                                    Économisez {(displayPlan.price * 12 * 0.2).toLocaleString()} F/an
                                                </span>
                                            )}
                                            <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                                                {getPrice(displayPlan.price).toLocaleString()}
                                            </span>
                                            <span className="text-gray-500 font-medium"> FCFA</span>
                                            <span className="block text-sm text-gray-400 mt-1">
                                                /mois {billingCycle === 'yearly' && '(facturé annuellement)'}
                                            </span>
                                            <span className="block text-xs text-gray-400 mt-1">
                                                sans engagement
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Features */}
                                    <div className="md:w-3/5 p-8 md:p-10 flex flex-col">
                                        <div className="mb-8">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Tout ce qui est inclus :</h4>
                                            <ul className="space-y-4">
                                                {displayPlan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <div className={`flex-shrink-0 p-1 rounded-full mr-3 ${feature.highlight ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-green-100 dark:bg-green-900/30 text-green-500'}`}>
                                                            <Check className="h-4 w-4" />
                                                        </div>
                                                        <span className={`text-sm ${feature.highlight ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                            {feature.text}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
                                            <button
                                                onClick={handleSubscribe}
                                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:-translate-y-1 bg-gradient-to-r ${displayPlan.color}`}
                                            >
                                                Choisir ce plan
                                            </button>
                                            <p className="text-center text-xs text-gray-400 mt-3">Paiement sécurisé via Wave, Orange Money ou Carte Bancaire</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CV Builder Pro Highlight */}
                        <div className="mt-16 max-w-5xl mx-auto">
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                                <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                                    <div className="md:w-1/2 text-center md:text-left">
                                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1 mb-6">
                                            <Crown className="w-4 h-4 text-yellow-400" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Inclus dans Jom+ Talent</span>
                                        </div>
                                        <h3 className="text-3xl font-extrabold mb-4">Générateur de CV Pro</h3>
                                        <p className="text-gray-300 text-lg mb-8">
                                            Créez des CV percutants qui passent les filtres ATS et séduisent les recruteurs.
                                            Une suite d'outils professionnels pour maximiser vos chances.
                                        </p>
                                        <button className="px-8 py-3 bg-white text-gray-900 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition-colors">
                                            Découvrir le Builder
                                        </button>
                                    </div>

                                    <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start gap-4">
                                            <div className="p-2 bg-primary-500/20 rounded-lg">
                                                <Layout className="w-6 h-6 text-primary-300" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">30 Templates Premium</h4>
                                                <p className="text-xs text-gray-400 mt-1">Designs modernes et ATS-friendly</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start gap-4">
                                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                                <Cloud className="w-6 h-6 text-blue-300" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Export PDF HD</h4>
                                                <p className="text-xs text-gray-400 mt-1">Qualité d'impression parfaite</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start gap-4">
                                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                                <Sparkles className="w-6 h-6 text-purple-300" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Génération IA</h4>
                                                <p className="text-xs text-gray-400 mt-1">Résumé et compétences auto</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start gap-4">
                                            <div className="p-2 bg-green-500/20 rounded-lg">
                                                <Save className="w-6 h-6 text-green-300" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">Autosave Illimité</h4>
                                                <p className="text-xs text-gray-400 mt-1">Ne perdez jamais votre travail</p>
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center justify-center gap-4">
                                            <Users className="w-5 h-5 text-gray-300" />
                                            <span className="font-bold">Plus de 5 CV par utilisateur</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* 1. Packs Recrutement (Hidden for Individuals) */}
                        {currentRole !== 'individual' && (
                            <section>
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Packs de Recrutement</h3>
                                    <p className="text-gray-500">Achetez des crédits d'annonces à la demande. Valables 12 mois.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {recruitmentPacks.map((pack, idx) => (
                                        <div key={idx} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border ${pack.popular ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-gray-200 dark:border-gray-700'} shadow-sm hover:shadow-lg transition-all text-center flex flex-col`}>
                                            {pack.popular && <span className="absolute top-0 right-0 -mt-3 mr-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">Best Seller</span>}
                                            <div className="mb-4">
                                                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{pack.count}</span>
                                                <span className="text-gray-500 text-sm block uppercase font-bold mt-1">Annonces</span>
                                            </div>
                                            <div className="mb-6">
                                                {pack.save && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">{pack.save}</span>}
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{pack.price.toLocaleString()} F</div>
                                            </div>
                                            <button className={`w-full py-2.5 rounded-lg font-bold text-sm mt-auto ${pack.popular ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200'}`}>
                                                Acheter
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 2. Visibilité & Boosts */}
                        <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                            <div className="relative z-10">
                                <div className="text-center mb-10">
                                    <h3 className="text-2xl font-bold mb-2">Boostez votre Visibilité</h3>
                                    <p className="text-gray-400">Sortez du lot et touchez plus de {currentRole === 'individual' ? 'recruteurs' : currentRole === 'company' ? 'candidats ou clients' : 'personnes'}.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {currentBoosts.map((boost, idx) => (
                                        <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-colors flex flex-col">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-primary-500 rounded-lg">
                                                    <boost.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <h4 className="font-bold text-lg">{boost.title}</h4>
                                            </div>
                                            <p className="text-gray-300 text-sm mb-6 min-h-[40px] flex-1">{boost.desc}</p>
                                            <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                                <span className="text-sm text-gray-400">{boost.duration}</span>
                                                <span className="font-bold text-lg">{boost.price.toLocaleString()} F</span>
                                            </div>
                                            <button className="w-full mt-4 py-2 rounded-lg bg-white text-gray-900 font-bold text-sm hover:bg-gray-100">
                                                Sélectionner
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 3. Régie Publicitaire */}
                        <section>
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Régie Publicitaire</h3>
                                <p className="text-gray-500">Diffusez votre marque auprès de notre audience qualifiée.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {advertisingSolutions.map((ad, idx) => (
                                    <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                                            <ad.icon className="w-8 h-8" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{ad.title}</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{ad.desc}</p>
                                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                            Tarification au {ad.price}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-8">
                                <button className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:shadow-lg transition-all">
                                    Contacter la régie publicitaire
                                </button>
                            </div>
                        </section>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Premium;
