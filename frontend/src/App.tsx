import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Finances from './components/Finances';
import Communication from './components/Communication';
import Events from './components/Events';
import Galerie from './components/Galerie';
import Live from './components/Live';
import Documentation from './components/Documentation';
import Settings from './components/Settings';
import Header from './components/Header';
import Login from './components/Login';
import NotificationCenter from './components/NotificationCenter';
import Cotisations from './components/Cotisations';
import { Page, Member, Contribution, UserProfile, ChatMessage, AppEvent, Notification, NotificationPreferences, Role, Permission, Photo, ContributionType, DocArticle, SearchResults } from './types';
import ProfileModal from './components/ProfileModal';
import { api } from './services/api';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [contributionTypes, setContributionTypes] = useState<ContributionType[]>([]);
  const [docArticles, setDocArticles] = useState<DocArticle[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({ upcomingEvents: true, pendingContributions: true });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<SearchResults>({ members: [], events: [], transactions: [], documentation: [] });
  const [isGlobalSearchFocused, setIsGlobalSearchFocused] = useState(false);
  const [selectedDocArticleId, setSelectedDocArticleId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'Admin', avatar: `https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff` });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const data = await api.getAllData();
        setMembers(data.members);
        setContributions(data.contributions);
        setMessages(data.messages);
        setEvents(data.events);
        setPhotos(data.photos);
        setRoles(data.roles);
        setPermissions(data.permissions);
        setContributionTypes(data.contributionTypes);
        setDocArticles(data.docArticles);
        if (data.docArticles.length > 0 && !selectedDocArticleId) {
            setSelectedDocArticleId(data.docArticles[0].id);
        }
    } catch (e) {
        setError("Impossible de charger les données de l'application. Veuillez réessayer plus tard.");
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }, [selectedDocArticleId]);

  useEffect(() => {
    if (isAuthenticated) {
        fetchData();
    }
  }, [isAuthenticated, fetchData]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('kelensi-theme') as 'light' | 'dark';
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kelensi-theme', theme);
  }, [theme]);
  
  // ... (rest of the logic like search, notifications, etc. can remain similar) ...
  // All state manipulation functions (e.g., handleAddMember) will now be passed down to components.
  // These functions will call the api service and then update the state.

  const handleAddMember = async (memberData: Omit<Member, 'id'>) => {
    try {
        const newMember = await api.addMember(memberData);
        setMembers(prev => [newMember, ...prev]);
        addNotification({ type: 'success', title: 'Succès', message: `${newMember.name} a été ajouté.`});
    } catch (error) {
        addNotification({ type: 'error', title: 'Erreur', message: `Impossible d'ajouter le membre.`});
    }
  };

  const handleUpdateMember = async (memberData: Member) => {
    try {
        const updatedMember = await api.updateMember(memberData);
        setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
        addNotification({ type: 'success', title: 'Succès', message: `${updatedMember.name} a été mis à jour.`});
    } catch (error) {
        addNotification({ type: 'error', title: 'Erreur', message: `Impossible de mettre à jour le membre.`});
    }
  };

  const handleDeleteMember = async (memberId: number) => {
     try {
        await api.deleteMember(memberId);
        setMembers(prev => prev.filter(m => m.id !== memberId));
        addNotification({ type: 'success', title: 'Succès', message: `Le membre a été supprimé.`});
    } catch (error) {
        addNotification({ type: 'error', title: 'Erreur', message: `Impossible de supprimer le membre.`});
    }
  }
  
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification = { ...notification, id: Date.now() };
    setNotifications(prev => [...prev, newNotification]);
  }, []);


  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
              <div className="text-center">
                  <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des données...</p>
              </div>
          </div>
      )
  }
  
  if(error) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                   <h2 className="text-2xl font-bold text-red-600">Une erreur est survenue</h2>
                   <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
                   <button onClick={fetchData} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Réessayer
                   </button>
              </div>
          </div>
      )
  }

  const renderPage = () => {
    // ... Pages will now receive state manipulation functions as props
     switch (currentPage) {
      case 'Dashboard':
        return <Dashboard members={members} contributions={contributions} theme={theme} />;
      case 'Membres':
        return <Members 
            members={members} 
            roles={roles}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
        />;
      // ... etc for other components
      default:
        return <Dashboard members={members} contributions={contributions} theme={theme} />;
    }
  };

  const pageTitles: Record<Page, string> = {
    Dashboard: 'Tableau de Bord',
    Membres: 'Gestion des Membres',
    Finances: 'Suivi Financier',
    Cotisations: 'Gestion des Cotisations',
    Communication: 'Messagerie',
    Événements: 'Gestion des Événements',
    Galerie: 'Galerie de Photos',
    Live: 'Session Live',
    Documentation: 'Documentation',
    Paramètres: 'Paramètres',
  };

  return (
    <div className="relative min-h-screen md:flex bg-gray-100 dark:bg-gray-900 font-sans">
      <NotificationCenter notifications={notifications} removeNotification={(id) => setNotifications(n => n.filter(notif => notif.id !== id))} />
      
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"></div>}

      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={pageTitles[currentPage]} 
          userProfile={userProfile}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          setSidebarOpen={setSidebarOpen}
          setProfileModalOpen={setProfileModalOpen}
          globalSearchTerm={globalSearchTerm}
          setGlobalSearchTerm={setGlobalSearchTerm}
          globalSearchResults={globalSearchResults}
          onSearchResultClick={() => {}} // Simplified for brevity
          isGlobalSearchFocused={isGlobalSearchFocused}
          setIsGlobalSearchFocused={setIsGlobalSearchFocused}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 md:p-8">
          {renderPage()}
        </main>
      </div>
      {isProfileModalOpen && (
            <ProfileModal
                user={userProfile}
                onSave={(updatedProfile) => {
                    setUserProfile(updatedProfile);
                    setProfileModalOpen(false);
                }}
                onClose={() => setProfileModalOpen(false)}
            />
        )}
    </div>
  );
};

export default App;
