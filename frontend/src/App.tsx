import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Members from './components/Members'; // Importation corrigée
import Finances from './components/Finances'; // Importation corrigée
import Communication from './components/Communication'; // Importation corrigée
import Live from './components/Live'; // Importation corrigée
import { Member, Role, Contribution } from './types'; 

// --- Mock Data Placeholder (À remplacer par votre propre logique de données) ---
// Note: Il est crucial que les types Member, Role, et Contribution soient définis dans './types'.
interface MockMember extends Omit<Member, 'joinDate'> { 
    joinDate: string; // Ajouté pour la démo, mais le composant Members.tsx ne doit pas le passer
}

const mockMembers: MockMember[] = [
    { id: 1, name: 'Jean Dupont', email: 'jean@example.com', phone: '0123456789', descendance: 'Famille A', birthDate: '1990-01-01', roleId: 'admin', status: 'Actif', avatar: '...', joinDate: '2022-01-01' },
];
const mockRoles: Role[] = [{ id: 'admin', name: 'Administrateur' }, { id: 'member', name: 'Membre' }];
const mockContributions: Contribution[] = [
    { id: 1, memberId: 1, memberName: 'Jean Dupont', amount: 50000, date: '2024-06-01', type: 'Cotisation', status: 'Payé' }
];

const App: React.FC = () => {
    const [members, setMembers] = useState<MockMember[]>(mockMembers);
    const [contributions, setContributions] = useState<Contribution[]>(mockContributions);
    const [currentView, setCurrentView] = useState('members');
    const [theme, setTheme] = useState<'light' | 'dark'>('light'); 

    // Simulation de la fonction d'ajout de membre
    const onAddMember = async (memberData: Omit<Member, 'id' | 'joinDate'>): Promise<void> => {
        // App.tsx insère les valeurs par défaut manquantes comme 'joinDate'
        const newMember: MockMember = {
            ...memberData,
            id: members.length + 1,
            joinDate: new Date().toISOString(), 
            status: 'Actif',
            avatar: memberData.avatar || `https://ui-avatars.com/api/?name=${memberData.name.replace(' ', '+')}&background=random`,
        };
        setMembers(prev => [...prev, newMember]);
    };
    
    // Simulations des autres fonctions (doivent être implémentées complètement)
    const onUpdateMember = async (memberData: Member) => console.log('Update Member', memberData);
    const onDeleteMember = async (memberId: number) => setMembers(prev => prev.filter(m => m.id !== memberId));
    const onAddContribution = async (data: Omit<Contribution, 'id' | 'memberName'>) => {
        console.log('Add Contribution', data);
        // Implement logic to add contribution
    };

    const renderContent = () => {
        // Le casting en 'any' est utilisé ici pour simplifier la démo, 
        // mais assurez-vous que les types s'alignent dans votre fichier `types.ts`.
        switch (currentView) {
            case 'members':
                return <Members 
                    members={members as Member[]} 
                    roles={mockRoles} 
                    onAddMember={onAddMember as any} 
                    onUpdateMember={onUpdateMember} 
                    onDeleteMember={onDeleteMember} 
                    theme={theme}
                />;
            case 'finances':
                return <Finances 
                    members={members as Member[]} 
                    contributions={contributions} 
                    onAddContribution={onAddContribution} 
                    theme={theme}
                />;
            case 'communication':
                return <Communication 
                    communications={[]} // Ajoutez vos données de communication ici
                    theme={theme}
                />;
            case 'live':
                return <Live />;
            default:
                return <div>Sélectionnez une vue.</div>;
        }
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} flex`}>
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} theme={theme} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header theme={theme} setTheme={setTheme} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;
