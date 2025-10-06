export type Page = 'Dashboard' | 'Membres' | 'Finances' | 'Communication' | 'Événements' | 'Paramètres';

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  birthDate: string; // Added for birthday feature
  status: 'Actif' | 'Inactif';
  avatar: string;
  role: string;
  descendance: string;
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
  type: string; // e.g., 'image/png', 'application/pdf'
  url: string; // Can be a data URL or a server URL
}

export interface ChatMessage {
  id: number;
  senderId: number | 'admin';
  receiverId: number | 'admin' | 0; // 0 represents the group chat
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