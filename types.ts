export type Page = 'Dashboard' | 'Membres' | 'Finances' | 'Communication' | 'Événements';

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

export interface ChatMessage {
  id: number;
  senderId: number | 'admin';
  receiverId: number | 'admin';
  text: string;
  timestamp: string;
}

export interface AppEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}


export interface UserProfile {
  name: string;
  avatar: string;
}