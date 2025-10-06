// Ce fichier contient les types utilisés côté backend.
// Il est très similaire à celui du frontend, mais peut diverger si nécessaire.

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
  joinDate: string;
  birthDate: string;
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
  date: string;
  type: 'Cotisation' | 'Don' | 'Événement';
  status: 'Payé' | 'En attente';
}

export interface Attachment {
  name: string;
  type: string;
  url: string;
}

export interface ChatMessage {
  id: number;
  senderId: number | 'admin';
  receiverId: number | 'admin' | 0; // 0 for group chat
  text: string;
  timestamp: string;
  attachment?: Attachment;
  status?: 'sent' | 'delivered' | 'read';
}

export type RSVPStatus = 'Attending' | 'Maybe' | 'Not Attending';

export interface RSVP {
  memberId: number;
  status: RSVPStatus;
}

export interface AppEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  rsvps?: RSVP[];
}

export interface Photo {
  id: number;
  url: string;
  title: string;
  description: string;
  uploadDate: string;
}

export interface DocArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  lastModified: string;
  attachments?: Attachment[];
}
