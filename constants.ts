import { Member, Contribution, Announcement } from './types';

const getDescendance = (name: string): string => {
    const parts = name.split(' ');
    return parts[parts.length - 1];
}

export const MOCK_MEMBERS: Member[] = [
    { id: 1, name: 'Kokoè Vicentia AMOUSSOUVI', email: 'kokoe.amoussouvi@kelensiconnect.com', phone: '97 88 12 34', joinDate: '2022-03-15', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoè+Vicentia+AMOUSSOUVI&background=random', role: 'Membre', descendance: 'AMOUSSOUVI' },
    { id: 2, name: 'Assion Didier AMOUSSOUVI', email: 'assion.amoussouvi@kelensiconnect.com', phone: '91 23 45 67', joinDate: '2021-11-20', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Assion+Didier+AMOUSSOUVI&background=random', role: 'Membre', descendance: 'AMOUSSOUVI' },
    { id: 3, name: 'Ekoué Roméo AMOUSSOUVI', email: 'ekoue.amoussouvi@kelensiconnect.com', phone: '98 76 54 32', joinDate: '2023-01-10', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ekoué+Roméo+AMOUSSOUVI&background=random', role: 'Membre', descendance: 'AMOUSSOUVI' },
    { id: 4, name: 'Akouété Come AMOUZOUVI', email: 'akouete.amouzouvi@kelensiconnect.com', phone: '90 11 22 33', joinDate: '2020-05-25', status: 'Inactif', avatar: 'https://ui-avatars.com/api/?name=Akouété+Come+AMOUZOUVI&background=random', role: 'Membre', descendance: 'AMOUZOUVI' },
    { id: 5, name: 'Akouètè AMOUZOUVI', email: 'akouete.amouzouvi@kelensiconnect.com', phone: '92 44 55 66', joinDate: '2022-08-01', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Akouètè+AMOUZOUVI&background=random', role: 'Membre', descendance: 'AMOUZOUVI' },
    { id: 6, name: 'Messan AMOUZOUVI', email: 'messan.amouzouvi@kelensiconnect.com', phone: '93 77 88 99', joinDate: '2023-02-18', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Messan+AMOUZOUVI&background=random', role: 'Membre', descendance: 'AMOUZOUVI' },
    { id: 7, name: 'Ayih Stéphane AMOUZOUVI', email: 'ayih.amouzouvi@kelensiconnect.com', phone: '99 10 20 30', joinDate: '2021-09-05', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ayih+Stéphane+AMOUZOUVI&background=random', role: 'Membre', descendance: 'AMOUZOUVI' },
    { id: 8, name: 'Dédé Daniela (Frère-vi) AMOUZOUVI', email: 'dede.amouzouvi@kelensiconnect.com', phone: '96 40 50 60', joinDate: '2020-02-20', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Dédé+Daniela+AMOUZOUVI&background=random', role: 'Membre', descendance: 'AMOUZOUVI' },
    { id: 9, name: 'Kokoè (Frère-vi) AMOUZOUVI', email: 'kokoe.amouzouvi@kelensiconnect.com', phone: '97 70 80 90', joinDate: '2023-05-10', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoè+AMOUZOUVI&background=random', role: 'Membre', descendance: 'AMOUZOUVI' },
    { id: 10, name: 'Ayokovi (Tassi Paté-To) LAWSON', email: 'ayokovi.lawson@kelensiconnect.com', phone: '91 12 13 14', joinDate: '2021-03-15', status: 'Inactif', avatar: 'https://ui-avatars.com/api/?name=Ayokovi+LAWSON&background=random', role: 'Membre', descendance: 'LAWSON' },
    { id: 11, name: 'Adakou Kafui Romaine KELENSI', email: 'adakou.kelensi@kelensiconnect.com', phone: '98 15 16 17', joinDate: '2020-01-01', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Adakou+Kafui+Romaine+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 12, name: 'Anoumou Onclo CF KELENSI', email: 'anoumou.kelensi@kelensiconnect.com', phone: '92 18 19 20', joinDate: '2023-08-01', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Anoumou+Onclo+CF+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 13, name: 'Messan, Doyen Famille KELENSI', email: 'messan.kelensi@kelensiconnect.com', phone: '93 21 22 23', joinDate: '2020-01-15', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Messan+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 14, name: 'Ayih Lucien KELENSI', email: 'ayih.kelensi@kelensiconnect.com', phone: '99 24 25 26', joinDate: '2022-11-15', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ayih+Lucien+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 15, name: 'Amavi Isidore KELENSI', email: 'amavi.kelensi@kelensiconnect.com', phone: '96 27 28 29', joinDate: '2022-10-20', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Amavi+Isidore+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 16, name: 'Ekoué Didier KELENSI', email: 'ekoue.kelensi@kelensiconnect.com', phone: '97 30 31 32', joinDate: '2021-08-01', status: 'Inactif', avatar: 'https://ui-avatars.com/api/?name=Ekoué+Didier+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 17, name: 'Akouélé KELENSI', email: 'akouele.kelensi@kelensiconnect.com', phone: '91 33 34 35', joinDate: '2023-01-12', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Akouélé+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 18, name: 'Dédé Prisca KELENSI', email: 'dede.kelensi@kelensiconnect.com', phone: '98 36 37 38', joinDate: '2020-02-20', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Dédé+Prisca+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 19, name: 'Kokoè Jacqueline KELENSI', email: 'kokoe.kelensi@kelensiconnect.com', phone: '92 39 40 41', joinDate: '2023-05-10', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoè+Jacqueline+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 20, name: 'Adakou Audrey KELENSI', email: 'adakou.kelensi@kelensiconnect.com', phone: '93 42 43 44', joinDate: '2021-03-15', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Adakou+Audrey+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 21, name: 'Ayélé Lagos KELENSI', email: 'ayele.kelensi@kelensiconnect.com', phone: '99 45 46 47', joinDate: '2022-09-05', status: 'Inactif', avatar: 'https://ui-avatars.com/api/?name=Ayélé+Lagos+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 22, name: 'Kokoégan Frida KELENSI', email: 'kokoegan.kelensi@kelensiconnect.com', phone: '96 48 49 50', joinDate: '2023-08-01', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoégan+Frida+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 23, name: 'Ayoko Popo KELENSI', email: 'ayoko.kelensi@kelensiconnect.com', phone: '97 51 52 53', joinDate: '2020-01-01', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ayoko+Popo+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 24, name: 'Ayoko Liliane KELENSI', email: 'ayoko.kelensi@kelensiconnect.com', phone: '91 54 55 56', joinDate: '2022-03-15', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ayoko+Liliane+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
    { id: 25, name: 'Messan Gentil KELENSI', email: 'messan.kelensi@kelensiconnect.com', phone: '98 57 58 59', joinDate: '2021-11-20', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Messan+Gentil+KELENSI&background=random', role: 'Membre', descendance: 'KELENSI' },
];


export const MOCK_CONTRIBUTIONS: Contribution[] = [
  { id: 1, memberId: 1, memberName: 'Kokoè Vicentia AMOUSSOUVI', amount: 25000, date: '2024-07-01', type: 'Cotisation', status: 'Payé' },
  { id: 2, memberId: 2, memberName: 'Assion Didier AMOUSSOUVI', amount: 25000, date: '2024-07-05', type: 'Cotisation', status: 'Payé' },
  { id: 3, memberId: 4, memberName: 'Akouété Come AMOUZOUVI', amount: 50000, date: '2024-06-20', type: 'Don', status: 'Payé' },
  { id: 4, memberId: 5, memberName: 'Akouètè AMOUZOUVI', amount: 10000, date: '2024-07-10', type: 'Événement', status: 'En attente' },
  { id: 5, memberId: 6, memberName: 'Messan AMOUZOUVI', amount: 25000, date: '2024-07-15', type: 'Cotisation', status: 'Payé' },
  { id: 6, memberId: 10, memberName: 'Ayokovi (Tassi Paté-To) LAWSON', amount: 15000, date: '2024-05-15', type: 'Événement', status: 'Payé' },
  { id: 7, memberId: 12, memberName: 'Anoumou Onclo CF KELENSI', amount: 40000, date: '2024-04-22', type: 'Don', status: 'Payé' },
  { id: 8, memberId: 15, memberName: 'Amavi Isidore KELENSI', amount: 25000, date: '2024-03-18', type: 'Cotisation', status: 'En attente' },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 1, title: 'Assemblée Générale Annuelle', content: 'Notre assemblée générale annuelle aura lieu le 30 août. Votre présence est cruciale.', date: '2024-07-15' },
    { id: 2, title: 'Événement Caritatif du Weekend', content: 'Rejoignez-nous ce weekend pour notre événement caritatif. Tous les fonds seront reversés à une bonne cause.', date: '2024-07-10' },
    { id: 3, title: 'Appel à Bénévoles', content: 'Nous recherchons des bénévoles pour notre prochain événement communautaire. Inscrivez-vous avant la fin du mois.', date: '2024-06-28' },
];