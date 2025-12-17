
export type UserRole = 'admin' | 'individual' | 'company' | 'etablissement' | 'institution';

export interface User {
  _id: string; // MongoDB ID
  id?: string; // Frontend alias
  name: string;
  email: string;
  roles: string[]; // Standardized on array
  role?: UserRole; // Legacy/Single role support
  isVerified?: boolean;
  createdAt?: string;
  avatar?: string;
  banner?: string;
  headline?: string;
  location?: string;
  phone?: string;
  bio?: string;
  about?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
}

export interface Service {
  _id?: string;
  id: string;
  title: string;
  category: string;
  price: number;
  providerName: string;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
}

export interface Job {
  _id?: string;
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'CDI' | 'CDD' | 'Freelance' | 'Stage';
  salary: string;
  postedAt: string;
  description: string;
  requirements: string[];
  logo: string;
}

export interface Training {
  _id?: string;
  id: string;
  title: string;
  institution: string;
  category: string;
  price: number;
  duration: string;
  students: number;
  image: string;
  rating: number;
  reviews: number;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  institutionId?: {
    name: string;
    avatar?: string;
  };
  description?: string;
  enrolledStudents?: string[];
  thumbnailUrl?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  logo?: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Skill {
  name: string;
  endorsements: number;
}

// --- SOCIAL NETWORK TYPES ---

export type PostType = 'text' | 'media' | 'service_offer' | 'service_request' | 'job_offer' | 'tender' | 'event' | 'live';

export interface SocialPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: UserRole;
    headline?: string;
  };
  type: PostType;
  content: string;
  image?: string;
  video?: string;
  document?: string; // For PDF/Calls for tender
  link?: {
    url: string;
    preview: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  location?: string;
  feeling?: string;
  // Specific fields for structured posts
  jobDetails?: {
    title: string;
    location: string;
    salary: string;
    serviceDetails?: {
      title: string;
      price: number;
      category: string;
    };
    trainingDetails?: {
      title: string;
      level: string;
      price: number;
    };
    eventDetails?: {
      title: string;
      date: string;
    };
  };
  serviceDetails?: {
    title: string;
    price: number;
    category: string;
  };
  trainingDetails?: {
    title: string;
    level: string;
    price: number;
  };
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  isViewed: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastMessage: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'job_alert';
  actorName: string;
  actorAvatar: string;
  content: string;
  timeAgo: string;
  isRead: boolean;
}

export interface Certificate {
  _id: string;
  id?: string;
  studentId: User;
  courseId: Training;
  certificateNumber: string;
  issuedDate: string;
  verificationCode: string;
  pdfUrl: string;
  metadata?: {
    courseName?: string;
    studentName?: string;
    completionDate?: string;
    grade?: string;
  };
}