import { Member, Contribution, ChatMessage, AppEvent, Photo, Role, Permission, ContributionType, DocArticle } from './types';

// NOTE: These types are slightly different for seeding purposes to include mock IDs
export type MockMember = Omit<Member, 'id'> & { mockId: number };
export type MockContribution = Omit<Contribution, 'id' | 'memberName'> & { memberId: number };
export type MockEvent = Omit<AppEvent, 'id'>;

export const MOCK_PERMISSIONS: Permission[] = [
    { id: 'view-members', category: 'Membres', name: 'Voir les membres', description: 'Peut voir la liste des membres et leurs profils.' },
    { id: 'manage-members', category: 'Membres', name: 'Gérer les membres', description: 'Peut ajouter, modifier et supprimer des membres.' },
    { id: 'export-members', category: 'Membres', name: 'Exporter les membres', description: 'Peut exporter la liste des membres en CSV.' },
    { id: 'view-finances', category: 'Finances', name: 'Voir les finances', description: 'Peut voir le tableau de bord financier et la liste des contributions.' },
    { id: 'manage-finances', category: 'Finances', name: 'Gérer les finances', description: 'Peut ajouter et modifier des contributions financières.' },
    { id: 'export-finances', category: 'Finances', name: 'Exporter les finances', description: 'Peut exporter les données financières.' },
    { id: 'view-events', category: 'Événements', name: 'Voir les événements', description: 'Peut voir la liste des événements.' },
    { id: 'manage-events', category: 'Événements', name: 'Gérer les événements', description: 'Peut créer, modifier et supprimer des événements.' },
    { id: 'manage-rsvps', category: 'Événements', name: 'Gérer les participations', description: 'Peut modifier les réponses de participation (RSVP) des membres.' },
    { id: 'use-communication', category: 'Communication', name: 'Utiliser la messagerie', description: 'Peut envoyer et recevoir des messages.' },
    { id: 'manage-settings', category: 'Paramètres', name: 'Gérer les paramètres', description: 'Peut modifier les paramètres de l\'application (apparence, notifications).' },
    { id: 'manage-roles', category: 'Paramètres', name: 'Gérer les rôles et permissions', description: 'Peut créer, modifier et supprimer des rôles et assigner des permissions.' },
];

export const MOCK_ROLES: Role[] = [
    { id: 'admin', name: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités de l\'application.', permissionIds: MOCK_PERMISSIONS.map(p => p.id) },
    { id: 'treasurer', name: 'Trésorier', description: 'Gère les finances, les cotisations et les dons.', permissionIds: ['view-members', 'view-finances', 'manage-finances', 'export-finances', 'view-events', 'use-communication'] },
    { id: 'secretary', name: 'Secrétaire', description: 'Gère les membres, les événements et la communication.', permissionIds: ['view-members', 'manage-members', 'export-members', 'view-events', 'manage-events', 'manage-rsvps', 'use-communication'] },
    { id: 'member', name: 'Membre', description: 'Accès limité aux informations générales.', permissionIds: ['view-events', 'use-communication'] },
];

export const MOCK_CONTRIBUTION_TYPES: ContributionType[] = [
    { id: 'cot-annuelle', name: 'Cotisation Annuelle', amount: 25000, frequency: 'Annuelle', description: 'Contribution annuelle de base pour tous les membres actifs.' },
    { id: 'frais-adhesion', name: 'Frais d\'adhésion', amount: 10000, frequency: 'Unique', description: 'Payable une seule fois lors de l\'inscription.' },
    { id: 'projet-ecole', name: 'Projet École', amount: 5000, frequency: 'Mensuelle', description: 'Contribution mensuelle pour le projet de construction de l\'école.' },
];

export const MOCK_MEMBERS: MockMember[] = [
    { mockId: 1, name: 'Kokoè Vicentia AMOUSSOUVI', email: 'kokoe.amoussouvi@kelensiconnect.com', phone: '97 88 12 34', joinDate: '2022-03-15', birthDate: '1990-07-28', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoè+Vicentia+AMOUSSOUVI&background=random', roleId: 'secretary', descendance: 'AMOUSSOUVI', contributionTypeIds: ['cot-annuelle', 'projet-ecole'] },
    // ... (All other members with their original mockId)
    { mockId: 25, name: 'Messan Gentil KELENSI', email: 'messan.gentil.kelensi@kelensiconnect.com', phone: '98 57 58 59', joinDate: '2021-11-20', birthDate: '1989-10-10', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Messan+Gentil+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle', 'projet-ecole'] },
];


export const MOCK_CONTRIBUTIONS: MockContribution[] = [
  { memberId: 1, amount: 25000, date: '2024-07-01', type: 'Cotisation', status: 'Payé' },
  { memberId: 2, amount: 25000, date: '2024-07-05', type: 'Cotisation', status: 'Payé' },
  // ... All other contributions
];

export const MOCK_EVENTS: MockEvent[] = [
    {
        title: 'Assemblée Générale Annuelle',
        date: '2024-09-15',
        time: '10:00',
        location: 'Salle Polyvalente, Lomé',
        description: 'Présentation du bilan annuel, élection du nouveau bureau et discussion des projets futurs.',
        rsvps: [
            { memberId: 1, status: 'Attending' },
            // ... All other RSVPs
        ]
    },
    // ... All other events
];

export const MOCK_PHOTOS: Omit<Photo, 'id'>[] = [
    { url: 'https://picsum.photos/seed/kelensi1/800/600', title: 'Assemblée Générale 2024', description: 'Photo de groupe lors de l\'AG annuelle de Septembre.', uploadDate: '2024-09-15T14:00:00Z' },
    // ... All other photos
];

export const MOCK_DOC_ARTICLES: DocArticle[] = [
    {
        id: 'welcome',
        title: 'Bienvenue sur KelensiConnect',
        category: 'Débuter',
        lastModified: '2024-07-20T10:00:00Z',
        content: `...`,
        attachments: [],
    },
    // ... All other articles
];
