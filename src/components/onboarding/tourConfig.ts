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
            title: 'Vue d\'ensemble',
            content: 'Voici un résumé de votre activité : candidatures envoyées, vues sur votre profil, et actions requises.',
            position: 'bottom',
        },
        {
            target: '[data-tour="cv-builder-link"]',
            title: 'Créez votre CV Pro',
            content: 'Accédez à notre constructeur de CV intelligent pour créer un CV parfait en quelques minutes.',
            position: 'right',
        },
        {
            target: '[data-tour="job-search-link"]',
            title: 'Trouvez un Job',
            content: 'Parcourez les offres d\'emploi exclusives et postulez en un clic avec votre profil JOM.',
            position: 'right',
        },
    ],
    recruiter_dashboard: [
        {
            target: '[data-tour="post-job-btn"]',
            title: 'Publier une Offre',
            content: 'Lancez votre recrutement en publiant une offre d\'emploi visible par nos milliers de talents.',
            position: 'bottom',
        },
        {
            target: '[data-tour="cvtheque-link"]',
            title: 'CVthèque',
            content: 'Cherchez proactivement des candidats dans notre base de données qualifiée.',
            position: 'right',
        }
    ]
};
