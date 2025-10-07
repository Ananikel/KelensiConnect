import { Member, Contribution, AppEvent, DocArticle, AllDataResponse, ChatMessage, Role, ContributionType } from '../types';

// NOTE: Cet utilitaire est un placeholder pour les vrais appels API/Firestore
// Il est crucial d'utiliser la clé API ici
const API_KEY = import.meta.env.VITE_API_KEY; 
const BASE_URL = 'http://localhost:5000/api/v1'; 

// Simulate fetching all initial data
export const fetchAllData = async (): Promise<AllDataResponse> => {
    // Dans une vraie application, cela ferait un appel pour charger les données initiales
    // fetch(`${BASE_URL}/data?apiKey=${API_KEY}`)
    
    // Données de simulation (MOCK DATA)
    await new Promise(resolve => setTimeout(resolve, 500)); 

    const mockRoles: Role[] = [
        { id: 'admin', name: 'Administrateur', description: 'Accès complet', permissionIds: [] },
        { id: 'member', name: 'Membre', description: 'Accès standard', permissionIds: [] },
    ];

    const mockMembers: Member[] = [
        { 
            id: 1, name: 'Jean Dupont', email: 'jean@dupont.com', phone: '0612345678', 
            joinDate: '2023-01-15', birthDate: '1985-05-20', status: 'Actif', 
            avatar: `https://placehold.co/40x40/4f46e5/ffffff?text=JD`, roleId: 'admin', 
            descendance: 'Branche A', contributionTypeIds: ['mensuelle_standard'] 
        },
        { 
            id: 2, name: 'Marie Curie', email: 'marie@curie.com', phone: '0698765432', 
            joinDate: '2023-03-01', birthDate: '1990-10-12', status: 'Actif', 
            avatar: `https://placehold.co/40x40/10b981/ffffff?text=MC`, roleId: 'member', 
            descendance: 'Branche B' 
        },
        { 
            id: 3, name: 'Alain Mérieux', email: 'alain@merieux.com', phone: '0711223344', 
            joinDate: '2024-06-01', birthDate: '1975-01-01', status: 'Inactif', 
            avatar: `https://placehold.co/40x40/f59e0b/ffffff?text=AM`, roleId: 'member', 
            descendance: 'Branche C' 
        },
    ];

    const mockContributions: Contribution[] = [
        { id: 1, memberId: 1, memberName: 'Jean Dupont', amount: 50, date: '2024-09-01', type: 'Cotisation', status: 'Payé' },
        { id: 2, memberId: 2, memberName: 'Marie Curie', amount: 100, date: '2024-08-20', type: 'Don', status: 'Payé' },
        { id: 3, memberId: 1, memberName: 'Jean Dupont', amount: 50, date: '2024-08-01', type: 'Cotisation', status: 'En attente' },
    ];
    
    const mockContributionTypes: ContributionType[] = [
        { id: 'mensuelle_standard', name: 'Cotisation Mensuelle', amount: 50, frequency: 'Mensuelle', description: 'Cotisation standard' },
    ];

    const mockEvents: AppEvent[] = [
        { 
            id: 1, title: 'Réunion du Conseil', date: '2025-10-20', time: '18:00', 
            location: 'Salle Polyvalente', description: 'Discussion des objectifs annuels.', 
            rsvps: [{ memberId: 1, status: 'Attending' }, { memberId: 2, status: 'Maybe' }]
        },
    ];

    const mockDocArticles: DocArticle[] = [
        { id: 'doc-1', title: 'Statuts de l\'association', content: 'Contenu des statuts...', category: 'Réglementation', lastModified: '2024-01-01' },
    ];
    
    return {
        members: mockMembers,
        roles: mockRoles,
        contributions: mockContributions,
        contributionTypes: mockContributionTypes,
        events: mockEvents,
        docArticles: mockDocArticles,
    };
};


export const simulateLogin = async (email: string): Promise<Member> => {
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const data = await fetchAllData();
    const user = data.members.find(m => m.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        throw new Error("Membre non trouvé.");
    }
    return user;
};

// Placeholder pour l'ajout d'une contribution
export const addContribution = async (data: Omit<Contribution, 'id' | 'memberName'>) => {
    console.log("Adding contribution:", data);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    // Ici, vous ajouteriez la logique réelle d'appel API
    console.log("Contribution added successfully (MOCK)");
};


// Placeholder pour la communication
export const sendChatMessage = async (content: string, attachments?: any[]): Promise<ChatMessage> => {
    // Logique d'envoi de message (MOCK)
    await new Promise(resolve => setTimeout(resolve, 100));
    const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'current_user_id', // ID de l'utilisateur actuel
        senderName: 'Moi',
        content,
        timestamp: new Date().toISOString(),
        attachments,
        status: 'sent',
    };
    return newMessage;
};

// Placeholder pour l'ajout de membre
export const addMember = async (memberData: Omit<Member, 'id'>) => {
    console.log("Adding member:", memberData);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    console.log("Member added successfully (MOCK)");
};

// Placeholder pour la mise à jour de membre
export const updateMember = async (memberData: Member) => {
    console.log("Updating member:", memberData);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    console.log("Member updated successfully (MOCK)");
};

// Placeholder pour la suppression de membre
export const deleteMember = async (memberId: number) => {
    console.log("Deleting member ID:", memberId);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    console.log("Member deleted successfully (MOCK)");
};
