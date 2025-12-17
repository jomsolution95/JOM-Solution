export interface TourStep {
    target: string; // CSS selector or data-attribute (e.g., '[data-tour="step-1"]')
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const TOUR_CONFIGS: Record<string, TourStep[]> = {
    candidate_dashboard: [
        {
            target: '[data-tour="dashboard-stats"]',
            title: 'Votre Tableau de Bord',
            content: 'Suivez vos candidatures, vos commandes de services et vos progrès d\'apprentissage en un coup d\'œil.',
            position: 'bottom',
        },
        {
            target: '[data-tour="service-search-link"]',
            title: 'Services & Missions',
            content: 'Trouvez des prestataires qualifiés ou proposez vos propres compétences pour gagner de l\'argent.',
            position: 'right',
        },
        {
            target: '[data-tour="job-search-link"]',
            title: 'Recherche d\'Emploi',
            content: 'Postulez aux offres d\'emploi. N\'oubliez pas que les comptes Premium ont accès aux offres en avant-première !',
            position: 'right',
        },
        {
            target: 'a[href="/premium"]', // Targeting the link directly
            title: 'Passez Premium',
            content: 'Débloquez des fonctionnalités exclusives : candidatures prioritaires, badge vérifié, et plus encore. (Essai de 30 jours offert à l\'inscription !)',
            position: 'right',
        }
    ],
    recruiter_dashboard: [
        {
            target: '[data-tour="post-job-btn"]',
            title: 'Publier une Offre',
            content: 'Créez une offre d\'emploi en quelques minutes. Utilisez la "Diffusion Automatique" (Fonctionnalité Premium) pour toucher plus de talents.',
            position: 'bottom',
        },
        {
            target: '[data-tour="cvtheque-link"]',
            title: 'Recherche de Talents',
            content: 'Accédez à notre base de CV qualifiés. Filtrez par compétences et contactez directement les candidats.',
            position: 'right',
        },
        {
            target: 'a[href="/premium"]',
            title: 'Solutions Entreprise',
            content: 'Boostez vos recrutements avec nos packs Premium : mise en avant des offres, accès illimité à la CVthèque et support dédié.',
            position: 'left',
        }
    ],
    etablissement_dashboard: [
        {
            target: 'a[href="/formations/create"]', // Assuming this link exists in quick actions
            title: 'Créer un Cours',
            content: 'Lancez votre première formation. Vous pouvez maintenant publier directement vos cours et les rendre visibles au public.',
            position: 'bottom',
        },
        {
            target: 'a[href="/academy/marketing"]',
            title: 'Outils Marketing',
            content: 'Boostez la visibilité de vos cours grâce aux campagnes email et à la mise en avant (Fonctionnalités Premium).',
            position: 'bottom',
        },
        {
            target: 'a[href="/academy/certificates"]',
            title: 'Certifications',
            content: 'Délivrez des certificats professionnels vérifiés à vos étudiants après réussite.',
            position: 'top',
        }
    ]
};
