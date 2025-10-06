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
import { Page, Member, Contribution, UserProfile, ChatMessage, AppEvent, Notification, NotificationPreferences, Role, Permission, Photo, ContributionType, DocArticle, SearchResults, Attachment } from './types';
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
  
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: 'Admin', avatar: `https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff` });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('kelensi-theme') as 'light' | 'dark') || 'light');

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
    } catch (e) {
        setError("Impossible de charger les données de l'application. Veuillez réessayer plus tard.");
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
        fetchData();
    }
  }, [isAuthenticated, fetchData]);

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kelensi-theme', theme);
  }, [theme]);
  
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification = { ...notification, id: Date.now() };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // --- Data Mutation Handlers ---
  const handleAddMember = async (memberData: Omit<Member, 'id'>) => {
    const newMember = await api.addMember(memberData);
    setMembers(prev => [newMember, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
    addNotification({ type: 'success', title: 'Succès', message: `${newMember.name} a été ajouté.`});
  };

  const handleUpdateMember = async (memberData: Member) => {
    const updatedMember = await api.updateMember(memberData);
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    addNotification({ type: 'success', title: 'Succès', message: `${updatedMember.name} a été mis à jour.`});
  };

  const handleDeleteMember = async (memberId: number) => {
    await api.deleteMember(memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
    addNotification({ type: 'success', title: 'Succès', message: `Le membre a été supprimé.`});
  }

  const handleAddContribution = async (contributionData: Omit<Contribution, 'id' | 'memberName'>) => {
    try {
      const newContribution = await api.addContribution(contributionData);
      setContributions(prev => [newContribution, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      addNotification({ type: 'success', title: 'Succès', message: `Contribution de ${newContribution.memberName} ajoutée.`});
    } catch (err) {
      addNotification({ type: 'error', title: 'Erreur', message: `Échec de l'ajout de la contribution.` });
      // Re-throw so component can handle UI state like isLoading
      throw err;
    }
  };

  const handleSendMessage = async (messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>) => {
    try {
        const newMessage = await api.addMessage(messageData);
        setMessages(prev => [...prev, newMessage]);
    } catch (err) {
        addNotification({ type: 'error', title: 'Erreur', message: `Échec de l'envoi du message.` });
        console.error(err);
        throw err;
    }
  };
  
  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard members={members} contributions={contributions} theme={theme} />;
      case 'Membres':
        return <Members members={members} roles={roles} onAddMember={handleAddMember} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} />;
      case 'Finances':
        return <Finances members={members} contributions={contributions} onAddContribution={handleAddContribution} theme={theme} />;
      case 'Communication':
        return <Communication members={members} messages={messages} onSendMessage={handleSendMessage} roles={roles} />;
      default:
        return <p>Page non implémentée</p>
    }
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const pageTitles: Record<Page, string> = { Dashboard: 'Tableau de Bord', Membres: 'Gestion des Membres', Finances: 'Suivi Financier', Cotisations: 'Gestion des Cotisations', Communication: 'Messagerie', Événements: 'Gestion des Événements', Galerie: 'Galerie de Photos', Live: 'Session Live', Documentation: 'Documentation', Paramètres: 'Paramètres' };

  return (
    <div className="relative min-h-screen md:flex bg-gray-100 dark:bg-gray-900 font-sans">
      <NotificationCenter notifications={notifications} removeNotification={(id) => setNotifications(n => n.filter(notif => notif.id !== id))} />
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={pageTitles[currentPage]} 
          userProfile={userProfile} 
          onLogout={handleLogout} 
          theme={theme} 
          toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
          setSidebarOpen={setSidebarOpen} 
          setProfileModalOpen={setProfileModalOpen}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 md:p-8">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
            ) : error ? (
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                   <h2 className="text-2xl font-bold text-red-600">Une erreur est survenue</h2>
                   <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
                   <button onClick={fetchData} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Réessayer</button>
                </div>
            ) : (
                renderPage()
            )}
        </main>
      </div>

      {isProfileModalOpen && <ProfileModal user={userProfile} onSave={(p) => { setUserProfile(p); setProfileModalOpen(false); }} onClose={() => setProfileModalOpen(false)} />}
    </div>
  );
};

export default App;