export type Page = 'Dashboard' | 'Membres' | 'Finances' | 'Cotisations' | 'Communication' | 'Événements' | 'Galerie' | 'Live' | 'Documentation' | 'Paramètres';

export interface Permission {
  id: string;
  category: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
}

export interface ContributionType {
  id: string;
  name: string;
  amount: number;
  frequency: 'Unique' | 'Mensuelle' | 'Trimestrielle' | 'Annuelle';
  description: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string; // Stored as ISO string
  birthDate: string; // Stored as ISO string
  status: 'Actif' | 'Inactif';
  avatar: string;
  roleId: string;
  descendance: string;
  contributionTypeIds?: string[];
}

export interface Contribution {
  id: number;
  memberId: number;
  memberName: string;
  amount: number;
  date: string; // Stored as ISO string
  type: 'Cotisation' | 'Don' | 'Événement';
  status: 'Payé' | 'En attente';
}

export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'image' | 'video';
  url: string; // Server or data URL
}

// NOUVEAU TYPE CRUCIAL pour la communication (basé sur le log d'erreur)
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string; // ISO string
  attachments?: Attachment[];
  status: 'sent' | 'delivered' | 'read';
}

export type RSVPStatus = 'Attending' | 'Maybe' | 'Not Attending';

export interface RSVP {
  memberId: number;
  status: RSVPStatus;
}

export interface AppEvent {
  id: number;
  title: string;
  date: string; // Stored as ISO string
  time: string;
  location: string;
  description: string;
  rsvps?: RSVP[];
}

export interface UserProfile {
  name: string;
  avatar: string;
}

export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

export interface Photo {
  id: number;
  url: string; // data URL or server URL
  title: string;
  description: string;
  uploadDate: string; // Stored as ISO string
}

export interface NotificationPreferences {
  upcomingEvents: boolean;
  pendingContributions: boolean;
}

export interface DocArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  lastModified: string; // Stored as ISO string
  attachments?: Attachment[];
}

export interface SearchResults {
    members: Member[];
    events: AppEvent[];
    transactions: Contribution[];
    documentation: DocArticle[];
}

// NOUVEAU TYPE CRUCIAL pour les services API (basé sur le log d'erreur)
export interface AllDataResponse {
    members: Member[];
    roles: Role[];
    contributions: Contribution[];
    contributionTypes: ContributionType[];
    events: AppEvent[];
    docArticles: DocArticle[];
}
