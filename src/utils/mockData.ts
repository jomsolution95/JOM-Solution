
import { UserRole, SocialPost, User, Experience, Education, Skill } from '../types';

// --- MOCK NETWORK PROFILES (Directory) ---
export interface NetworkProfile {
  id: string;
  type: UserRole;
  name: string;
  avatar: string;
  banner?: string;
  headline: string;
  location: string;
  followers: number;
  tags: string[];
  isVerified?: boolean;
  isOpenToWork?: boolean;
  isHiring?: boolean;
}

export const mockNetwork: NetworkProfile[] = [
  // INDIVIDUALS
  { id: 'u1', type: 'individual', name: 'Jean Michel', avatar: 'https://ui-avatars.com/api/?name=Jean+Michel&background=random', headline: 'Plombier Certifié | Entrepreneur', location: 'Dakar, Sénégal', followers: 580, tags: ['Plomberie', 'Rénovation', 'BTP'], isOpenToWork: true },
  { id: 'u2', type: 'individual', name: 'Aminata Sow', avatar: 'https://ui-avatars.com/api/?name=Aminata+Sow&background=random', headline: 'Consultante Marketing Digital', location: 'Abidjan, Côte d\'Ivoire', followers: 1200, tags: ['Marketing', 'SEO', 'Social Media'], isVerified: true },
  { id: 'u3', type: 'individual', name: 'Moussa Diop', avatar: 'https://ui-avatars.com/api/?name=Moussa+Diop&background=random', headline: 'Développeur Fullstack React', location: 'Dakar, Sénégal', followers: 340, tags: ['React', 'Node.js', 'TypeScript'] },
  { id: 'u4', type: 'individual', name: 'Sarah Koné', avatar: 'https://ui-avatars.com/api/?name=Sarah+Kone&background=random', headline: 'Étudiante en Droit', location: 'Bamako, Mali', followers: 150, tags: ['Droit des affaires', 'Juridique'] },

  // COMPANIES
  { id: 'c1', type: 'company', name: 'Tech Solutions', avatar: 'https://ui-avatars.com/api/?name=Tech+Solutions&background=0D9488&color=fff', headline: 'Transformation Digitale & Cloud', location: 'Dakar, Plateau', followers: 5400, tags: ['Informatique', 'Conseil'], isVerified: true, isHiring: true },
  { id: 'c2', type: 'company', name: 'BTP Ouest', avatar: 'https://ui-avatars.com/api/?name=BTP+Ouest&background=orange&color=fff', headline: 'Construction et Génie Civil', location: 'Abidjan, Cocody', followers: 2300, tags: ['Construction', 'Ingénierie'] },

  // INSTITUTIONS
  { id: 's1', type: 'etablissement', name: 'Institut Excellence', avatar: 'https://ui-avatars.com/api/?name=Institut+Excellence&background=purple&color=fff', headline: 'Formation Professionnelle Supérieure', location: 'Dakar, Mermoz', followers: 8900, tags: ['Commerce', 'Informatique'], isVerified: true },
  { id: 's2', type: 'etablissement', name: 'Digital Academy', avatar: 'https://ui-avatars.com/api/?name=Digital+Academy&background=blue&color=fff', headline: 'École des métiers du numérique', location: 'Lomé, Togo', followers: 1200, tags: ['Design', 'Code'] },


];

// --- MOCK POSTS ---
export const mockPosts: SocialPost[] = [
  {
    id: '1',
    author: {
      id: 'u2',
      name: 'Aminata Sow',
      avatar: 'https://ui-avatars.com/api/?name=Aminata+Sow&background=random',
      role: 'individual',
      headline: 'Consultante Marketing Digital'
    },
    type: 'text',
    content: 'Très heureuse d\'annoncer que j\'ai obtenu ma certification Google Ads ! Prête à aider encore plus d\'entreprises à booster leur visibilité. 🚀 #MarketingDigital #GoogleAds #Freelance',
    timestamp: 'Il y a 2 heures',
    likes: 45,
    comments: 12,
    shares: 5,
    isLiked: true
  },
  {
    id: '2',
    author: {
      id: 'c1',
      name: 'Tech Solutions',
      avatar: 'https://ui-avatars.com/api/?name=Tech+Solutions&background=0D9488&color=fff',
      role: 'company',
      headline: 'Transformation Digitale & Cloud'
    },
    type: 'job_offer',
    content: 'Nous recrutons un Développeur Fullstack React/Node.js pour rejoindre notre équipe à Dakar. CDI, Salaire attractif.',
    jobDetails: {
      title: 'Développeur Fullstack',
      location: 'Dakar, Sénégal',
      salary: '800k - 1.2M FCFA'
    },
    timestamp: 'Il y a 5 heures',
    likes: 89,
    comments: 24,
    shares: 45
  },
  {
    id: '3',
    author: {
      id: 'u1',
      name: 'Jean Michel',
      avatar: 'https://ui-avatars.com/api/?name=Jean+Michel&background=random',
      role: 'individual',
      headline: 'Plombier Certifié'
    },
    type: 'media',
    content: 'Fin de chantier sur les Almadies. Rénovation complète de la salle de bain. Merci à la famille Diop pour la confiance ! 🛠️🚿',
    image: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    timestamp: 'Hier',
    likes: 32,
    comments: 4,
    shares: 1,
    location: 'Les Almadies, Dakar'
  },

  {
    id: 'a5-post-1',
    author: {
      id: 'a5',
      name: 'Institut Excellence',
      avatar: 'https://ui-avatars.com/api/?name=Institut+Excellence&background=purple&color=fff',
      role: 'etablissement',
      headline: 'Formation Supérieure'
    },
    type: 'text',
    content: '🎓 Félicitations à notre promotion 2024 de Master en Gestion de Projet ! Vous faites notre fierté.',
    timestamp: 'Il y a 4 jours',
    likes: 210,
    comments: 45,
    shares: 12
  }
];

// --- MOCK PROFILES (Detailed) ---
export const mockProfiles: Record<string, User & { experience?: Experience[], education?: Education[], skills?: Skill[] }> = {
  'u1': { // Jean Michel
    id: 'u1',
    name: 'Jean Michel',
    email: 'jean@test.com',
    role: 'individual',
    avatar: 'https://ui-avatars.com/api/?name=Jean+Michel&background=random',
    banner: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=80',
    headline: 'Plombier Certifié | Entrepreneur',
    location: 'Dakar, Sénégal',
    about: 'Plombier expérimenté avec plus de 10 ans d\'expérience dans la rénovation et l\'installation sanitaire.',
    experience: [
      { id: '1', title: 'Chef d\'équipe Plomberie', company: 'BTP Construction', location: 'Dakar', startDate: '2018', current: true, description: 'Gestion d\'une équipe de 5 plombiers.' },
    ],
    education: [
      { id: '1', school: 'Lycée Technique de Dakar', degree: 'CAP', field: 'Plomberie', startDate: '2013', endDate: '2015' }
    ],
    skills: [{ name: 'Plomberie', endorsements: 24 }, { name: 'Soudure', endorsements: 15 }]
  },
  'u2': { // Aminata Sow
    id: 'u2',
    name: 'Aminata Sow',
    email: 'aminata@test.com',
    role: 'individual',
    avatar: 'https://ui-avatars.com/api/?name=Aminata+Sow&background=random',
    banner: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    headline: 'Consultante Marketing | Stratégie Digitale',
    location: 'Abidjan, Côte d\'Ivoire',
    about: 'Passionnée par le marketing digital, j\'aide les marques à construire une présence en ligne forte.',
    experience: [{ id: '1', title: 'Freelance', company: 'Self', location: 'Abidjan', startDate: '2020', current: true, description: 'Consulting 360°' }],
    skills: [{ name: 'SEO', endorsements: 45 }, { name: 'Social Media', endorsements: 50 }]
  },
  'c1': { // Tech Solutions
    id: 'c1',
    name: 'Tech Solutions SARL',
    email: 'contact@techsolutions.sn',
    role: 'company',
    avatar: 'https://ui-avatars.com/api/?name=Tech+Solutions&background=0D9488&color=fff',
    banner: 'https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&w=1200&q=80',
    headline: 'Leader en Transformation Digitale',
    location: 'Dakar, Plateau',
    website: 'www.techsolutions.sn',
    about: 'Tech Solutions est une entreprise de services numériques spécialisée dans le développement web.',
    skills: [{ name: 'Dev Web', endorsements: 150 }, { name: 'Cloud', endorsements: 90 }]
  },

  'a5': { // Institut Excellence
    id: 'a5',
    name: 'Institut Excellence',
    email: 'info@institut-excellence.sn',
    role: 'etablissement',
    avatar: 'https://ui-avatars.com/api/?name=Institut+Excellence&background=purple&color=fff',
    banner: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    headline: 'Formation Professionnelle',
    location: 'Dakar, Mermoz',
    about: 'Nous formons les leaders de demain.',
    skills: [{ name: 'Pédagogie', endorsements: 120 }]
  },
  // Legacy mappings for robustness
  'a1': {
    id: 'a1',
    name: 'Jean Michel',
    email: 'jean@test.com',
    role: 'individual',
    avatar: 'https://ui-avatars.com/api/?name=Jean+Michel&background=random',
    headline: 'Plombier Certifié',
    location: 'Dakar',
    about: 'Profil Legacy',
    skills: []
  }
};
