import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Correction TS2307: Les chemins d'importation sont corrigés
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Finances from './components/Finances';
import Communication from './components/Communication';
import Live from './components/Live';
import { Page, Member, Role, Contribution, UserProfile, SearchResults, AppEvent, DocArticle } from './types';

// Données fictives (initiales ou après correction)
const INITIAL_ROLES: Role[] = [
    // Correction TS2739: Ajout des propriétés manquantes 
    { id: '1', name: 'Administrateur', description: "Gestion complète des membres et finances.", permissionIds: ['full_access'] },
    { id: '2', name: 'Membre', description: "Accès en lecture seule aux données de base.", permissionIds: ['read_only'] },
];

const INITIAL_MEMBERS: Member[] = [
    // ... (Ajoutez vos données de membres ici)
    // Exemple minimal :
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', joinDate: '2022-01-01', birthDate: '1980-05-15', status: 'Actif', avatar: '/avatars/john.jpg', roleId: '1', descendance: 'Kelensi' },
];

const INITIAL_CONTRIBUTIONS: Contribution[] = [
    // ... (Ajoutez vos données de cotisations ici)
    // Exemple minimal :
    { id: 1, memberId: 1, memberName: 'John Doe', amount: 50, date: '2023-10-01', type: 'Cotisation', status: 'Payé' },
];

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'Admin User', avatar: '/avatars/admin.jpg' });
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
    const [contributions, setContributions] = useState<Contribution[]>(INITIAL_CONTRIBUTIONS);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [globalSearchResults, setGlobalSearchResults] = useState<SearchResults>({ members: [], events: [], transactions: [], documentation: [] });
    const [isGlobalSearchFocused, setIsGlobalSearchFocused] = useState(false);

    // Fonction de bascule de thème
    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            return newTheme;
        });
    }, []);

    useEffect(() => {
        // Initialiser le thème au chargement
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);
    
    // Logique de recherche globale (non implémentée ici, mais nécessaire pour la compilation)
    useEffect(() => {
        // Logique de recherche simple basée sur le terme de recherche global
        if (globalSearchTerm.length > 2) {
            const term = globalSearchTerm.toLowerCase();
            const filteredMembers = members.filter(m => m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term));
            const filteredContributions = contributions.filter(c => c.memberName.toLowerCase().includes(term) || c.type.toLowerCase().includes(term));
            
            setGlobalSearchResults({
                members: filteredMembers,
                events: [], // Simuler des résultats vides pour les événements/docs
                transactions: filteredContributions,
                documentation: []
            });
        } else {
            setGlobalSearchResults({ members: [], events: [], transactions: [], documentation: [] });
        }
    }, [globalSearchTerm, members, contributions]);

    // Fonctions CRUD minimales (nécessaires pour les props)
    const handleAddMember = async (memberData: Omit<Member, 'id'>) => {
        // Logique d'ajout...
        console.log("Ajout membre", memberData);
    };

    const handleUpdateMember = async (memberData: Member) => {
        // Logique de mise à jour...
        console.log("Mise à jour membre", memberData);
    };

    const handleDeleteMember = async (memberId: number) => {
        // Logique de suppression...
        console.log("Suppression membre", memberId);
    };
    
    const handleAddContribution = async (data: Omit<Contribution, 'id' | 'memberName'>) => {
        // Logique d'ajout de contribution...
        console.log("Ajout contribution", data);
    };

    const handleSearchResultClick = (item: Member | AppEvent | Contribution | DocArticle, type: keyof SearchResults) => {
        console.log(`Résultat cliqué: ${type} -`, item);
        setGlobalSearchTerm('');
        setIsGlobalSearchFocused(false);
        // Basculer vers la page appropriée
        if (type === 'members') setCurrentPage('Membres');
        else if (type === 'transactions') setCurrentPage('Finances');
        // Ajouter d'autres cas si nécessaire
    };

    const renderContent = useMemo(() => {
        const commonProps = { members: members, theme: theme, roles: INITIAL_ROLES };
        
        switch (currentPage) {
            case 'Dashboard':
                return <Dashboard {...commonProps} />;
            case 'Membres':
                return <Members {...commonProps} onAddMember={handleAddMember} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} />;
            case 'Finances':
                return <Finances {...commonProps} contributions={contributions} onAddContribution={handleAddContribution} />;
            case 'Communication':
                return <Communication {...commonProps} />;
            case 'Live':
                return <Live theme={theme} />;
            case 'Cotisations':
            case 'Événements':
            case 'Galerie':
            case 'Documentation':
            case 'Paramètres':
            default:
                return (
                    <div className="p-6">
                        <h2 className="text-xl font-semibold dark:text-white">Page {currentPage} en construction</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Le contenu de cette page sera bientôt disponible.</p>
                    </div>
                );
        }
    }, [currentPage, members, contributions, theme]);
    
    return (
        <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
            <Sidebar 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage} 
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            <div className="flex flex-col flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <Header 
                    title={currentPage} 
                    userProfile={userProfile} 
                    onLogout={() => console.log('Logout')} 
                    theme={theme}
                    toggleTheme={toggleTheme}
                    setSidebarOpen={setSidebarOpen}
                    setProfileModalOpen={setProfileModalOpen}
                    globalSearchTerm={globalSearchTerm}
                    setGlobalSearchTerm={setGlobalSearchTerm}
                    globalSearchResults={globalSearchResults}
                    onSearchResultClick={handleSearchResultClick}
                    isGlobalSearchFocused={isGlobalSearchFocused}
                    setIsGlobalSearchFocused={setIsGlobalSearchFocused}
                />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
                    {renderContent}
                </main>

                {/* Profile Modal Placeholder */}
                {isProfileModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                            <h3 className="text-xl font-bold dark:text-white">Mon Profil</h3>
                            <p className="mt-4 dark:text-gray-300">Détails du profil de {userProfile.name}.</p>
                            <div className="mt-6 flex justify-end">
                                <button onClick={() => setProfileModalOpen(false)} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Fermer</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
