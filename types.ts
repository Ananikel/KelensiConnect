
export type Page = 'Dashboard' | 'Membres' | 'Finances' | 'Communication';

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
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

export interface Announcement {
    id: number;
    title: string;
    content: string;
    date: string;
}