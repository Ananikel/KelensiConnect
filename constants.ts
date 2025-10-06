import { Member, Contribution, ChatMessage, AppEvent, Photo, Role, Permission } from './types';

export const MOCK_PERMISSIONS: Permission[] = [
    // Membres
    { id: 'view-members', category: 'Membres', name: 'Voir les membres', description: 'Peut voir la liste des membres et leurs profils.' },
    { id: 'manage-members', category: 'Membres', name: 'Gérer les membres', description: 'Peut ajouter, modifier et supprimer des membres.' },
    { id: 'export-members', category: 'Membres', name: 'Exporter les membres', description: 'Peut exporter la liste des membres en CSV.' },

    // Finances
    { id: 'view-finances', category: 'Finances', name: 'Voir les finances', description: 'Peut voir le tableau de bord financier et la liste des contributions.' },
    { id: 'manage-finances', category: 'Finances', name: 'Gérer les finances', description: 'Peut ajouter et modifier des contributions financières.' },
    { id: 'export-finances', category: 'Finances', name: 'Exporter les finances', description: 'Peut exporter les données financières.' },

    // Événements
    { id: 'view-events', category: 'Événements', name: 'Voir les événements', description: 'Peut voir la liste des événements.' },
    { id: 'manage-events', category: 'Événements', name: 'Gérer les événements', description: 'Peut créer, modifier et supprimer des événements.' },
    { id: 'manage-rsvps', category: 'Événements', name: 'Gérer les participations', description: 'Peut modifier les réponses de participation (RSVP) des membres.' },

    // Communication
    { id: 'use-communication', category: 'Communication', name: 'Utiliser la messagerie', description: 'Peut envoyer et recevoir des messages.' },

    // Paramètres
    { id: 'manage-settings', category: 'Paramètres', name: 'Gérer les paramètres', description: 'Peut modifier les paramètres de l\'application (apparence, notifications).' },
    { id: 'manage-roles', category: 'Paramètres', name: 'Gérer les rôles et permissions', description: 'Peut créer, modifier et supprimer des rôles et assigner des permissions.' },
];

export const MOCK_ROLES: Role[] = [
    { 
        id: 'admin', 
        name: 'Administrateur', 
        description: 'Accès complet à toutes les fonctionnalités de l\'application.',
        permissionIds: MOCK_PERMISSIONS.map(p => p.id) // All permissions
    },
    { 
        id: 'treasurer', 
        name: 'Trésorier', 
        description: 'Gère les finances, les cotisations et les dons.',
        permissionIds: ['view-members', 'view-finances', 'manage-finances', 'export-finances', 'view-events', 'use-communication']
    },
    { 
        id: 'secretary', 
        name: 'Secrétaire', 
        description: 'Gère les membres, les événements et la communication.',
        permissionIds: ['view-members', 'manage-members', 'export-members', 'view-events', 'manage-events', 'manage-rsvps', 'use-communication']
    },
    { 
        id: 'member', 
        name: 'Membre', 
        description: 'Accès limité aux informations générales.',
        permissionIds: ['view-events', 'use-communication']
    },
];

const getDescendance = (name: string): string => {
    const parts = name.split(' ');
    return parts[parts.length - 1];
}

// Assuming current date is around July 2024 for mock data
export const MOCK_MEMBERS: Member[] = [
    { id: 1, name: 'Kokoè Vicentia AMOUSSOUVI', email: 'kokoe.amoussouvi@kelensiconnect.com', phone: '97 88 12 34', joinDate: '2022-03-15', birthDate: '1990-07-28', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoè+Vicentia+AMOUSSOUVI&background=random', roleId: 'secretary', descendance: 'AMOUSSOUVI' },
    { id: 2, name: 'Assion Didier AMOUSSOUVI', email: 'assion.amoussouvi@kelensiconnect.com', phone: '91 23 45 67', joinDate: '2021-11-20', birthDate: '1985-08-05', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Assion+Didier+AMOUSSOUVI&background=random', roleId: 'member', descendance: 'AMOUSSOUVI' },
    { id: 3, name: 'Ekoué Roméo AMOUSSOUVI', email: 'ekoue.amoussouvi@kelensiconnect.com', phone: '98 76 54 32', joinDate: '2023-01-10', birthDate: '1992-01-15', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ekoué+Roméo+AMOUSSOUVI&background=random', roleId: 'member', descendance: 'AMOUSSOUVI' },
    { id: 4, name: 'Akouété Come AMOUZOUVI', email: 'akouete.amouzouvi@kelensiconnect.com', phone: '90 11 22 33', joinDate: '2020-05-25', birthDate: '1988-11-30', status: 'Inactif', avatar: 'https://ui-avatars.com/api/?name=Akouété+Come+AMOUZOUVI&background=random', roleId: 'member', descendance: 'AMOUZOUVI' },
    { id: 5, name: 'Akouètè AMOUZOUVI', email: 'akouete.amouzouvi@kelensiconnect.com', phone: '92 44 55 66', joinDate: '2022-08-01', birthDate: '1995-07-25', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Akouètè+AMOUZOUVI&background=random', roleId: 'member', descendance: 'AMOUZOUVI' },
    { id: 6, name: 'Messan AMOUZOUVI', email: 'messan.amouzouvi@kelensiconnect.com', phone: '93 77 88 99', joinDate: '2023-02-18', birthDate: '1979-02-20', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Messan+AMOUZOUVI&background=random', roleId: 'member', descendance: 'AMOUZOUVI' },
    { id: 7, name: 'Ayih Stéphane AMOUZOUVI', email: 'ayih.amouzouvi@kelensiconnect.com', phone: '99 10 20 30', joinDate: '2021-09-05', birthDate: '1991-09-10', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ayih+Stéphane+AMOUZOUVI&background=random', roleId: 'member', descendance: 'AMOUZOUVI' },
    { id: 8, name: 'Dédé Daniela (Frère-vi) AMOUZOUVI', email: 'dede.amouzouvi@kelensiconnect.com', phone: '96 40 50 60', joinDate: '2020-02-20', birthDate: '2000-08-12', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Dédé+Daniela+AMOUZOUVI&background=random', roleId: 'member', descendance: 'AMOUZOUVI' },
    { id: 9, name: 'Kokoè (Frère-vi) AMOUZOUVI', email: 'kokoe.amouzouvi@kelensiconnect.com', phone: '97 70 80 90', joinDate: '2023-05-10', birthDate: '1998-05-15', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoè+AMOUZOUVI&background=random', roleId: 'member', descendance: 'AMOUZOUVI' },
    { id: 10, name: 'Ayokovi (Tassi Paté-To) LAWSON', email: 'ayokovi.lawson@kelensiconnect.com', phone: '91 12 13 14', joinDate: '2021-03-15', birthDate: '1975-03-20', status: 'Inactif', avatar: 'https://ui-avatars.com/api/?name=Ayokovi+LAWSON&background=random', roleId: 'member', descendance: 'LAWSON' },
    { id: 11, name: 'Adakou Kafui Romaine KELENSI', email: 'adakou.kelensi@kelensiconnect.com', phone: '98 15 16 17', joinDate: '2020-01-01', birthDate: '1980-12-25', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Adakou+Kafui+Romaine+KELENSI&background=random', roleId: 'admin', descendance: 'KELENSI' },
    { id: 12, name: 'Anoumou Onclo CF KELENSI', email: 'anoumou.kelensi@kelensiconnect.com', phone: '92 18 19 20', joinDate: '2023-08-01', birthDate: '1968-07-22', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Anoumou+Onclo+CF+KELENSI&background=random', roleId: 'treasurer', descendance: 'KELENSI' },
    { id: 13, name: 'Messan, Doyen Famille KELENSI', email: 'messan.kelensi@kelensiconnect.com', phone: '93 21 22 23', joinDate: '2020-01-15', birthDate: '1955-01-01', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Messan+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
    { id: 14, name: 'Ayih Lucien KELENSI', email: 'ayih.kelensi@kelensiconnect.com', phone: '99 24 25 26', joinDate: '2022-11-15', birthDate: '1977-11-18', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ayih+Lucien+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
    { id: 15, name: 'Amavi Isidore KELENSI', email: 'amavi.kelensi@kelensiconnect.com', phone: '96 27 28 29', joinDate: '2022-10-20', birthDate: '1982-10-25', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Amavi+Isidore+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
    { id: 16, name: 'Ekoué Didier KELENSI', email: 'ekoue.kelensi@kelensiconnect.com', phone: '97 30 31 32', joinDate: '2021-08-01', birthDate: '1993-08-10', status: 'Inactif', avatar: 'https://ui-avatars.com/api/?name=Ekoué+Didier+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
    { id: 17, name: 'Akouélé KELENSI', email: 'akouele.kelensi@kelensiconnect.com', phone: '91 33 34 35', joinDate: '2023-01-12', birthDate: '2001-01-20', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Akouélé+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
    { id: 18, name: 'Dédé Prisca KELENSI', email: 'dede.kelensi@kelensiconnect.com', phone: '98 36 37 38', joinDate: '2020-02-20', birthDate: '1999-03-03', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Dédé+Prisca+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
    { id: 19, name: 'Kokoè Jacqueline KELENSI', email: 'kokoe.kelensi@kelensiconnect.com', phone: '92 39 40 41', joinDate: '2023-05-10', birthDate: '1970-05-12', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoè+Jacqueline+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
    { id: 20, name: 'Adakou Audrey KELENSI', email: 'adakou.kelensi@kelensiconnect.com', phone: '93 42 43 44', joinDate: '2021-03-15', birthDate: '1994-04-18', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Adakou+Audrey+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
    { id: 21, name: 'Ayélé Lagos KELENSI', email: 'ayele.kelensi@kelensiconnect.com', phone: '99 45 46 47', joinDate: '2022-09-05', birthDate: '1986-09-09', status: 'Inactif', avatar: 'https://ui-avatars.com/api/?name=Ayélé+Lagos+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
    { id: 22, name: 'Kokoégan Frida KELENSI', email: 'kokoegan.kelensi@kelensiconnect.com', phone: '96 48 49 50', joinDate: '2023-08-01', birthDate: '1997-08-01', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoégan+Frida+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
    { id: 23, name: 'Ayoko Popo KELENSI', email: 'ayoko.kelensi@kelensiconnect.com', phone: '97 51 52 53', joinDate: '2020-01-01', birthDate: '1984-06-28', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ayoko+Popo+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
    { id: 24, name: 'Ayoko Liliane KELENSI', email: 'ayoko.kelensi@kelensiconnect.com', phone: '91 54 55 56', joinDate: '2022-03-15', birthDate: '1996-07-19', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ayoko+Liliane+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
    { id: 25, name: 'Messan Gentil KELENSI', email: 'messan.kelensi@kelensiconnect.com', phone: '98 57 58 59', joinDate: '2021-11-20', birthDate: '1989-10-10', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Messan+Gentil+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI' },
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

export const MOCK_MESSAGES: ChatMessage[] = [
    { id: 1, senderId: 1, receiverId: 'admin', text: 'Bonjour, j\'ai une question sur ma cotisation.', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    { id: 2, senderId: 'admin', receiverId: 1, text: 'Bonjour Kokoè, bien sûr. Quelle est votre question ?', timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(), status: 'read' },
    { id: 3, senderId: 1, receiverId: 'admin', text: 'Je voudrais savoir si mon dernier paiement a bien été enregistré.', timestamp: new Date(Date.now() - 1000 * 60 * 13).toISOString() },
    { id: 4, senderId: 'admin', receiverId: 1, text: 'Je vérifie cela tout de suite.', timestamp: new Date(Date.now() - 1000 * 60 * 13).toISOString(), status: 'read' },
    
    { id: 5, senderId: 5, receiverId: 'admin', text: 'Salut ! Juste pour dire que j\'ai adoré le dernier événement.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 6, senderId: 'admin', receiverId: 5, text: 'Merci beaucoup ! Nous sommes ravis que ça vous ait plu.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 30).toISOString(), status: 'read' },

    { id: 7, senderId: 12, receiverId: 'admin', text: 'Pourrait-on avoir le compte rendu de la dernière réunion ?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

export const MOCK_EVENTS: AppEvent[] = [
    {
        id: 1,
        title: 'Assemblée Générale Annuelle',
        date: '2024-09-15',
        time: '10:00',
        location: 'Salle Polyvalente, Lomé',
        description: 'Présentation du bilan annuel, élection du nouveau bureau et discussion des projets futurs.',
        rsvps: [
            { memberId: 1, status: 'Attending' },
            { memberId: 2, status: 'Attending' },
            { memberId: 5, status: 'Attending' },
            { memberId: 8, status: 'Maybe' },
            { memberId: 10, status: 'Not Attending' },
            { memberId: 11, status: 'Attending' },
            { memberId: 13, status: 'Attending' },
        ]
    },
    {
        id: 2,
        title: 'Journée de Salubrité',
        date: '2024-08-20',
        time: '08:00',
        location: 'Quartier Bè',
        description: 'Opération de nettoyage et de sensibilisation à l\'environnement dans le quartier.',
        rsvps: [
            { memberId: 3, status: 'Attending' },
            { memberId: 6, status: 'Attending' },
            { memberId: 7, status: 'Attending' },
            { memberId: 18, status: 'Attending' },
            { memberId: 22, status: 'Maybe' },
        ]
    },
    {
        id: 3,
        title: 'Fête de Fin d\'Année',
        date: '2024-12-22',
        time: '19:00',
        location: 'Plage de Lomé',
        description: 'Célébration de fin d\'année avec tous les membres et leurs familles. Musique, repas et animations.',
        rsvps: []
    },
     {
        id: 4,
        title: 'Collecte de fonds pour la rentrée',
        date: '2024-06-10',
        time: '09:00',
        location: 'Maison des Jeunes',
        description: 'Événement caritatif pour collecter des fournitures scolaires pour les enfants défavorisés.',
        rsvps: [
             { memberId: 1, status: 'Attending' },
             { memberId: 4, status: 'Not Attending' },
             { memberId: 12, status: 'Attending' },
             { memberId: 14, status: 'Attending' },
             { memberId: 15, status: 'Attending' },
             { memberId: 19, status: 'Attending' },
             { memberId: 20, status: 'Attending' },
        ]
    }
];

export const MOCK_PHOTOS: Photo[] = [
    { id: 1, url: 'https://picsum.photos/seed/kelensi1/800/600', title: 'Assemblée Générale 2024', description: 'Photo de groupe lors de l\'AG annuelle de Septembre.', uploadDate: '2024-09-15T14:00:00Z' },
    { id: 2, url: 'https://picsum.photos/seed/kelensi2/800/600', title: 'Journée de Salubrité', description: 'Membres nettoyant le quartier de Bè.', uploadDate: '2024-08-20T10:30:00Z' },
    { id: 3, url: 'https://picsum.photos/seed/kelensi3/800/600', title: 'Collecte de fonds', description: 'Remise de fournitures scolaires.', uploadDate: '2024-06-10T12:00:00Z' },
    { id: 4, url: 'https://picsum.photos/seed/kelensi4/800/600', title: 'Réunion du bureau', description: 'Planification des activités du prochain trimestre.', uploadDate: '2024-05-05T18:00:00Z' },
    { id: 5, url: 'https://picsum.photos/seed/kelensi5/800/600', title: 'Formation des membres', description: 'Atelier sur la gestion de projet.', uploadDate: '2024-04-12T09:00:00Z' },
    { id: 6, url: 'https://picsum.photos/seed/kelensi6/800/600', title: 'Fête de l\'indépendance', description: 'Célébration en groupe.', uploadDate: '2024-04-27T19:00:00Z' },
    { id: 7, url: 'https://picsum.photos/seed/kelensi7/800/600', title: 'Activité sportive', description: 'Match de football amical entre membres.', uploadDate: '2024-03-18T16:00:00Z' },
    { id: 8, url: 'https://picsum.photos/seed/kelensi8/800/600', title: 'Visite caritative', description: 'Visite à l\'orphelinat "La Providence".', uploadDate: '2024-02-22T11:00:00Z' },
    { id: 9, url: 'https://picsum.photos/seed/kelensi9/800/600', title: 'Fête de Fin d\'Année 2023', description: 'Célébration à la plage de Lomé.', uploadDate: '2023-12-22T20:00:00Z' },
];