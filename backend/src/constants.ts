import { Member, Contribution, ChatMessage, AppEvent, Photo, Role, Permission, ContributionType, DocArticle } from './types';

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

export const MOCK_CONTRIBUTION_TYPES: ContributionType[] = [
    { id: 'cot-annuelle', name: 'Cotisation Annuelle', amount: 25000, frequency: 'Annuelle', description: 'Contribution annuelle de base pour tous les membres actifs.' },
    { id: 'frais-adhesion', name: 'Frais d\'adhésion', amount: 10000, frequency: 'Unique', description: 'Payable une seule fois lors de l\'inscription.' },
    { id: 'projet-ecole', name: 'Projet École', amount: 5000, frequency: 'Mensuelle', description: 'Contribution mensuelle pour le projet de construction de l\'école.' },
];

const getDescendance = (name: string): string => {
    const parts = name.split(' ');
    return parts[parts.length - 1];
}

// Assuming current date is around July 2024 for mock data
export const MOCK_MEMBERS: Omit<Member, 'id'>[] = [
    { name: 'Kokoè Vicentia AMOUSSOUVI', email: 'kokoe.amoussouvi@kelensiconnect.com', phone: '97 88 12 34', joinDate: '2022-03-15', birthDate: '1990-07-28', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoè+Vicentia+AMOUSSOUVI&background=random', roleId: 'secretary', descendance: 'AMOUSSOUVI', contributionTypeIds: ['cot-annuelle', 'projet-ecole'] },
    { name: 'Assion Didier AMOUSSOUVI', email: 'assion.amoussouvi@kelensiconnect.com', phone: '91 23 45 67', joinDate: '2021-11-20', birthDate: '1985-08-05', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Assion+Didier+AMOUSSOUVI&background=random', roleId: 'member', descendance: 'AMOUSSOUVI', contributionTypeIds: ['cot-annuelle'] },
    { name: 'Ekoué Roméo AMOUSSOUVI', email: 'ekoue.amoussouvi@kelensiconnect.com', phone: '98 76 54 32', joinDate: '2023-01-10', birthDate: '1992-01-15', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ekoué+Roméo+AMOUSSOUVI&background=random', roleId: 'member', descendance: 'AMOUSSOUVI', contributionTypeIds: ['cot-annuelle', 'frais-adhesion'] },
    { name: 'Akouété Come AMOUZOUVI', email: 'akouete.amouzouvi@kelensiconnect.com', phone: '90 11 22 33', joinDate: '2020-05-25', birthDate: '1988-11-30', status: 'Inactif', avatar: 'https://ui-avatars.com/api/?name=Akouété+Come+AMOUZOUVI&background=random', roleId: 'member', descendance: 'AMOUZOUVI', contributionTypeIds: [] },
    { name: 'Akouètè AMOUZOUVI', email: 'akouete.amouzouvi.2@kelensiconnect.com', phone: '92 44 55 66', joinDate: '2022-08-01', birthDate: '1995-07-25', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Akouètè+AMOUZOUVI&background=random', roleId: 'member', descendance: 'AMOUZOUVI', contributionTypeIds: ['cot-annuelle'] },
    { name: 'Messan AMOUZOUVI', email: 'messan.amouzouvi@kelensiconnect.com', phone: '93 77 88 99', joinDate: '2023-02-18', birthDate: '1979-02-20', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Messan+AMOUZOUVI&background=random', roleId: 'member', descendance: 'AMOUZOUVI', contributionTypeIds: ['cot-annuelle', 'frais-adhesion'] },
    { name: 'Ayih Stéphane AMOUZOUVI', email: 'ayih.amouzouvi@kelensiconnect.com', phone: '99 10 20 30', joinDate: '2021-09-05', birthDate: '1991-09-10', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ayih+Stéphane+AMOUZOUVI&background=random', roleId: 'member', descendance: 'AMOUZOUVI', contributionTypeIds: ['cot-annuelle', 'projet-ecole'] },
    { name: 'Dédé Daniela (Frère-vi) AMOUZOUVI', email: 'dede.amouzouvi@kelensiconnect.com', phone: '96 40 50 60', joinDate: '2020-02-20', birthDate: '2000-08-12', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Dédé+Daniela+AMOUZOUVI&background=random', roleId: 'member', descendance: 'AMOUZOUVI', contributionTypeIds: ['cot-annuelle'] },
    { name: 'Kokoè (Frère-vi) AMOUZOUVI', email: 'kokoe.amouzouvi@kelensiconnect.com', phone: '97 70 80 90', joinDate: '2023-05-10', birthDate: '1998-05-15', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoè+AMOUZOUVI&background=random', roleId: 'member', descendance: 'AMOUZOUVI', contributionTypeIds: ['cot-annuelle', 'frais-adhesion'] },
    { name: 'Ayokovi (Tassi Paté-To) LAWSON', email: 'ayokovi.lawson@kelensiconnect.com', phone: '91 12 13 14', joinDate: '2021-03-15', birthDate: '1975-03-20', status: 'Inactif', avatar: 'https://ui-avatars.com/api/?name=Ayokovi+LAWSON&background=random', roleId: 'member', descendance: 'LAWSON', contributionTypeIds: [] },
    { name: 'Adakou Kafui Romaine KELENSI', email: 'adakou.kafui.kelensi@kelensiconnect.com', phone: '98 15 16 17', joinDate: '2020-01-01', birthDate: '1980-12-25', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Adakou+Kafui+Romaine+KELENSI&background=random', roleId: 'admin', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle', 'projet-ecole'] },
    { name: 'Anoumou Onclo CF KELENSI', email: 'anoumou.kelensi@kelensiconnect.com', phone: '92 18 19 20', joinDate: '2023-08-01', birthDate: '1968-07-22', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Anoumou+Onclo+CF+KELENSI&background=random', roleId: 'treasurer', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle', 'frais-adhesion'] },
    { name: 'Messan, Doyen Famille KELENSI', email: 'messan.doyen.kelensi@kelensiconnect.com', phone: '93 21 22 23', joinDate: '2020-01-15', birthDate: '1955-01-01', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Messan+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle'] },
    { name: 'Ayih Lucien KELENSI', email: 'ayih.kelensi@kelensiconnect.com', phone: '99 24 25 26', joinDate: '2022-11-15', birthDate: '1977-11-18', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ayih+Lucien+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle'] },
    { name: 'Amavi Isidore KELENSI', email: 'amavi.kelensi@kelensiconnect.com', phone: '96 27 28 29', joinDate: '2022-10-20', birthDate: '1982-10-25', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Amavi+Isidore+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle'] },
    { name: 'Ekoué Didier KELENSI', email: 'ekoue.kelensi@kelensiconnect.com', phone: '97 30 31 32', joinDate: '2021-08-01', birthDate: '1993-08-10', status: 'Inactif', avatar: 'https://ui-avatars.com/api/?name=Ekoué+Didier+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: [] },
    { name: 'Akouélé KELENSI', email: 'akouele.kelensi@kelensiconnect.com', phone: '91 33 34 35', joinDate: '2023-01-12', birthDate: '2001-01-20', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Akouélé+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle', 'frais-adhesion'] },
    { name: 'Dédé Prisca KELENSI', email: 'dede.kelensi@kelensiconnect.com', phone: '98 36 37 38', joinDate: '2020-02-20', birthDate: '1999-03-03', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Dédé+Prisca+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle'] },
    { name: 'Kokoè Jacqueline KELENSI', email: 'kokoe.kelensi@kelensiconnect.com', phone: '92 39 40 41', joinDate: '2023-05-10', birthDate: '1970-05-12', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoè+Jacqueline+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle'] },
    { name: 'Adakou Audrey KELENSI', email: 'adakou.audrey.kelensi@kelensiconnect.com', phone: '93 42 43 44', joinDate: '2021-03-15', birthDate: '1994-04-18', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Adakou+Audrey+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle'] },
    { name: 'Ayélé Lagos KELENSI', email: 'ayele.kelensi@kelensiconnect.com', phone: '99 45 46 47', joinDate: '2022-09-05', birthDate: '1986-09-09', status: 'Inactif', avatar: 'https://ui-avatars.com/api/?name=Ayélé+Lagos+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: [] },
    { name: 'Kokoégan Frida KELENSI', email: 'kokoegan.kelensi@kelensiconnect.com', phone: '96 48 49 50', joinDate: '2023-08-01', birthDate: '1997-08-01', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Kokoégan+Frida+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle', 'frais-adhesion', 'projet-ecole'] },
    { name: 'Ayoko Popo KELENSI', email: 'ayoko.popo.kelensi@kelensiconnect.com', phone: '97 51 52 53', joinDate: '2020-01-01', birthDate: '1984-06-28', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ayoko+Popo+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle'] },
    { name: 'Ayoko Liliane KELENSI', email: 'ayoko.liliane.kelensi@kelensiconnect.com', phone: '91 54 55 56', joinDate: '2022-03-15', birthDate: '1996-07-19', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Ayoko+Liliane+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle'] },
    { name: 'Messan Gentil KELENSI', email: 'messan.gentil.kelensi@kelensiconnect.com', phone: '98 57 58 59', joinDate: '2021-11-20', birthDate: '1989-10-10', status: 'Actif', avatar: 'https://ui-avatars.com/api/?name=Messan+Gentil+KELENSI&background=random', roleId: 'member', descendance: 'KELENSI', contributionTypeIds: ['cot-annuelle', 'projet-ecole'] },
];


export const MOCK_CONTRIBUTIONS: Omit<Contribution, 'id' | 'memberName'>[] = [
  { memberId: 1, amount: 25000, date: '2024-07-01', type: 'Cotisation', status: 'Payé' },
  { memberId: 2, amount: 25000, date: '2024-07-05', type: 'Cotisation', status: 'Payé' },
  { memberId: 4, amount: 50000, date: '2024-06-20', type: 'Don', status: 'Payé' },
  { memberId: 5, amount: 10000, date: '2024-07-10', type: 'Événement', status: 'En attente' },
  { memberId: 6, amount: 25000, date: '2024-07-15', type: 'Cotisation', status: 'Payé' },
  { memberId: 10, amount: 15000, date: '2024-05-15', type: 'Événement', status: 'Payé' },
  { memberId: 12, amount: 40000, date: '2024-04-22', type: 'Don', status: 'Payé' },
  { memberId: 15, amount: 25000, date: '2024-03-18', type: 'Cotisation', status: 'En attente' },
];

export const MOCK_MESSAGES: Omit<ChatMessage, 'id'>[] = [
    { senderId: 1, receiverId: 'admin', text: 'Bonjour, j\'ai une question sur ma cotisation.', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    { senderId: 'admin', receiverId: 1, text: 'Bonjour Kokoè, bien sûr. Quelle est votre question ?', timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(), status: 'read' },
    { senderId: 1, receiverId: 'admin', text: 'Je voudrais savoir si mon dernier paiement a bien été enregistré.', timestamp: new Date(Date.now() - 1000 * 60 * 13).toISOString() },
    { senderId: 'admin', receiverId: 1, text: 'Je vérifie cela tout de suite.', timestamp: new Date(Date.now() - 1000 * 60 * 13).toISOString(), status: 'read' },
    
    { senderId: 5, receiverId: 'admin', text: 'Salut ! Juste pour dire que j\'ai adoré le dernier événement.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { senderId: 'admin', receiverId: 5, text: 'Merci beaucoup ! Nous sommes ravis que ça vous ait plu.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 30).toISOString(), status: 'read' },

    { senderId: 12, receiverId: 'admin', text: 'Pourrait-on avoir le compte rendu de la dernière réunion ?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

export const MOCK_EVENTS: Omit<AppEvent, 'id'>[] = [
    {
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
        title: 'Fête de Fin d\'Année',
        date: '2024-12-22',
        time: '19:00',
        location: 'Plage de Lomé',
        description: 'Célébration de fin d\'année avec tous les membres et leurs familles. Musique, repas et animations.',
        rsvps: []
    },
     {
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

export const MOCK_PHOTOS: Omit<Photo, 'id'>[] = [
    { url: 'https://picsum.photos/seed/kelensi1/800/600', title: 'Assemblée Générale 2024', description: 'Photo de groupe lors de l\'AG annuelle de Septembre.', uploadDate: '2024-09-15T14:00:00Z' },
    { url: 'https://picsum.photos/seed/kelensi2/800/600', title: 'Journée de Salubrité', description: 'Membres nettoyant le quartier de Bè.', uploadDate: '2024-08-20T10:30:00Z' },
    { url: 'https://picsum.photos/seed/kelensi3/800/600', title: 'Collecte de fonds', description: 'Remise de fournitures scolaires.', uploadDate: '2024-06-10T12:00:00Z' },
    { url: 'https://picsum.photos/seed/kelensi4/800/600', title: 'Réunion du bureau', description: 'Planification des activités du prochain trimestre.', uploadDate: '2024-05-05T18:00:00Z' },
    { url: 'https://picsum.photos/seed/kelensi5/800/600', title: 'Formation des membres', description: 'Atelier sur la gestion de projet.', uploadDate: '2024-04-12T09:00:00Z' },
    { url: 'https://picsum.photos/seed/kelensi6/800/600', title: 'Fête de l\'indépendance', description: 'Célébration en groupe.', uploadDate: '2024-04-27T19:00:00Z' },
    { url: 'https://picsum.photos/seed/kelensi7/800/600', title: 'Activité sportive', description: 'Match de football amical entre membres.', uploadDate: '2024-03-18T16:00:00Z' },
    { url: 'https://picsum.photos/seed/kelensi8/800/600', title: 'Visite caritative', description: 'Visite à l\'orphelinat "La Providence".', uploadDate: '2024-02-22T11:00:00Z' },
    { url: 'https://picsum.photos/seed/kelensi9/800/600', title: 'Fête de Fin d\'Année 2023', description: 'Célébration à la plage de Lomé.', uploadDate: '2023-12-22T20:00:00Z' },
];

export const MOCK_DOC_ARTICLES: DocArticle[] = [
    {
        id: 'welcome',
        title: 'Bienvenue sur KelensiConnect',
        category: 'Débuter',
        lastModified: '2024-07-20T10:00:00Z',
        content: `Bienvenue dans le guide d'utilisation de KelensiConnect.
Cette application est conçue pour simplifier la gestion de votre association.

Fonctionnalités principales :
- Tableau de bord : Vue d'ensemble des statistiques clés.
- Gestion des membres : Ajoutez, modifiez et suivez les informations des membres.
- Suivi financier : Enregistrez les cotisations et les dons.
- Communication : Messagerie interne pour rester en contact.

Explorez les différentes sections pour en savoir plus !`,
        attachments: [],
    },
    {
        id: 'add-member',
        title: 'Comment ajouter un membre',
        category: 'Gestion des Membres',
        lastModified: '2024-07-21T11:30:00Z',
        content: `Pour ajouter un nouveau membre, suivez ces étapes :

1. Accédez à la page "Membres" depuis le menu latéral.
2. Cliquez sur le bouton "Ajouter Membre" en haut à droite.
3. Remplissez le formulaire avec les informations du membre.
   - Le nom, l'email, la date de naissance et la descendance sont obligatoires.
   - Vous pouvez prendre une photo avec la webcam ou laisser l'avatar par défaut.
4. Cliquez sur "Ajouter" pour sauvegarder le nouveau membre.

Le membre apparaîtra immédiatement dans la liste.`,
        attachments: [],
    },
    {
        id: 'manage-contributions',
        title: 'Gérer les types de cotisations',
        category: 'Finances',
        lastModified: '2024-07-22T09:00:00Z',
        content: `La page "Cotisations" vous permet de définir les différents types de contributions financières.

Créer un type de cotisation :
- Allez sur la page "Cotisations".
- Cliquez sur "Ajouter un type".
- Donnez un nom, un montant, une fréquence (ex: Annuelle) et une description.

Assigner un type à un membre :
- Dans la seconde section de la page "Cotisations", trouvez le membre dans la liste.
- Cliquez sur "Gérer" à droite de son nom.
- Cochez les cases correspondant aux cotisations que ce membre doit payer.
- Enregistrez les modifications.

Une fois assignées, vous pourrez suivre les paiements effectifs dans la page "Finances".`,
        attachments: [],
    },
    {
        id: 'faq-1',
        title: 'Puis-je exporter les données ?',
        category: 'FAQ',
        lastModified: '2024-07-19T15:00:00Z',
        content: `Oui, l'exportation des données est possible pour plusieurs modules.

- Membres : Sur la page "Membres", cliquez sur le bouton "Exporter" pour télécharger la liste complète au format CSV, compatible avec Excel et Google Sheets.
- Finances : Sur la page "Finances", le bouton "Exporter" vous permet de télécharger un rapport de toutes les transactions financières enregistrées.

Assurez-vous d'avoir les permissions nécessaires (rôle Administrateur ou Trésorier) pour accéder à ces fonctionnalités.`,
        attachments: [],
    }
];
