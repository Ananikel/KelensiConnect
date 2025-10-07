
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
import { MOCK_MEMBERS, MOCK_CONTRIBUTIONS, MOCK_MESSAGES, MOCK_EVENTS, MOCK_PHOTOS, MOCK_ROLES, MOCK_PERMISSIONS, MOCK_CONTRIBUTION_TYPES, MOCK_DOC_ARTICLES } from './constants';


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // App State
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [contributionTypes, setContributionTypes] = useState<ContributionType[]>([]);
  const [docArticles, setDocArticles] = useState<DocArticle[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  // UI State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<SearchResults>({ members: [], events: [], transactions: [], documentation: [] });
  const [isGlobalSearchFocused, setIsGlobalSearchFocused] = useState(false);
  const [selectedDocArticleId, setSelectedDocArticleId] = useState<string | null>(null);

  // User Preferences
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('kelensi-user-profile');
      return saved ? JSON.parse(saved) : { name: 'Admin', avatar: `https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff` };
    } catch {
      return { name: 'Admin', avatar: `https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff` };
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('kelensi-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('kelensi-notif-prefs');
      return saved ? JSON.parse(saved) : { upcomingEvents: true, pendingContributions: true };
    } catch {
      return { upcomingEvents: true, pendingContributions: true };
    }
  });
  
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification = { ...notification, id: Date.now() };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

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
        setError("Impossible de charger les données de l'application. Le serveur backend est peut-être indisponible.");
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }, [selectedDocArticleId]);

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
        fetchData();
    }
  }, [isAuthenticated, fetchData]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('kelensi-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('kelensi-user-profile', JSON.stringify(userProfile));
  }, [userProfile]);
  
  useEffect(() => {
    localStorage.setItem('kelensi-notif-prefs', JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  // Debounced global search
  useEffect(() => {
    if (globalSearchTerm.trim().length < 2) {
        setGlobalSearchResults({ members: [], events: [], transactions: [], documentation: [] });
        return;
    }
    const handler = setTimeout(() => {
        const term = globalSearchTerm.toLowerCase();
        setGlobalSearchResults({
            members: members.filter(m => m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term)).slice(0, 3),
            events: events.filter(e => e.title.toLowerCase().includes(term) || e.description.toLowerCase().includes(term)).slice(0, 3),
            transactions: contributions.filter(c => c.memberName.toLowerCase().includes(term)).slice(0, 3),
            documentation: docArticles.filter(a => a.title.toLowerCase().includes(term) || a.content.toLowerCase().includes(term)).slice(0, 3)
        });
    }, 300);
    return () => clearTimeout(handler);
  }, [globalSearchTerm, members, events, contributions, docArticles]);


  // --- Data Mutation Handlers ---
  const handleAddMember = async (memberData: Omit<Member, 'id'>) => {
    const newMember = await api.addMember(memberData);
    setMembers(prev => [...prev, newMember].sort((a,b) => a.name.localeCompare(b.name)));
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
      const newContribution = await api.addContribution(contributionData);
      setContributions(prev => [newContribution, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      addNotification({ type: 'success', title: 'Succès', message: `Contribution de ${newContribution.memberName} ajoutée.`});
  };

  const handleSendMessage = async (messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>) => {
      const newMessage = await api.addMessage(messageData);
      setMessages(prev => [...prev, newMessage]);
  };
  
  // NOTE: The following handlers manipulate local state as backend endpoints are not yet implemented.
  const handleSaveRole = (roleToSave: Role) => {
      const existing = roles.find(r => r.id === roleToSave.id);
      if (existing) {
          setRoles(roles.map(r => (r.id === roleToSave.id ? roleToSave : r)));
          addNotification({ type: 'success', title: 'Rôle modifié', message: `Le rôle "${roleToSave.name}" a été mis à jour.` });
      } else {
          setRoles([...roles, roleToSave]);
          addNotification({ type: 'success', title: 'Rôle ajouté', message: `Le rôle "${roleToSave.name}" a été créé.` });
      }
  };

  const handleDeleteRole = (roleId: string) => {
      setRoles(roles.filter(r => r.id !== roleId));
      addNotification({ type: 'success', title: 'Rôle supprimé', message: 'Le rôle a été supprimé avec succès.' });
  };
  
  const handleSaveContributionType = (type: ContributionType) => {
    const existing = contributionTypes.find(t => t.id === type.id);
    if (existing) {
      setContributionTypes(contributionTypes.map(t => t.id === type.id ? type : t));
      addNotification({ type: 'success', title: 'Type modifié', message: `Le type de cotisation "${type.name}" a été mis à jour.` });
    } else {
      setContributionTypes([...contributionTypes, type]);
      addNotification({ type: 'success', title: 'Type ajouté', message: `Le type de cotisation "${type.name}" a été créé.` });
    }
  };

  const handleDeleteContributionType = (typeId: string) => {
    setContributionTypes(contributionTypes.filter(t => t.id !== typeId));
    setMembers(prevMembers => prevMembers.map(m => ({
      ...m,
      contributionTypeIds: m.contributionTypeIds?.filter(id => id !== typeId) || []
    })));
    addNotification({ type: 'success', title: 'Type supprimé', message: 'Le type de cotisation a été supprimé.' });
  };
  
  const handleUpdateMemberContributions = (memberId: number, typeIds: string[]) => {
    setMembers(prevMembers => prevMembers.map(m => m.id === memberId ? { ...m, contributionTypeIds: typeIds } : m));
    addNotification({ type: 'info', title: 'Assignations modifiées', message: 'Les cotisations du membre ont été mises à jour.' });
  };
  
  const handleSaveDocArticle = (articleToSave: DocArticle) => {
    const existing = docArticles.find(a => a.id === articleToSave.id);
    if (existing) {
        setDocArticles(docArticles.map(a => (a.id === articleToSave.id ? articleToSave : a)));
        addNotification({ type: 'success', title: 'Documentation mise à jour', message: `L'article "${articleToSave.title}" a été modifié.` });
    } else {
        setDocArticles(prev => [...prev, articleToSave]);
        addNotification({ type: 'success', title: 'Article ajouté', message: `L'article "${articleToSave.title}" a été créé.` });
    }
  };

  const handleDeleteDocArticle = (articleId: string) => {
      const articleToDelete = docArticles.find(a => a.id === articleId);
      if (articleToDelete) {
        setDocArticles(docArticles.filter(a => a.id !== articleId));
        addNotification({ type: 'success', title: 'Article supprimé', message: `L'article "${articleToDelete.title}" a été supprimé.` });
      }
  };
  
  const handleImportMembers = (newMembers: Member[]) => {
    // This should ideally be a backend operation to handle duplicates properly
    const existingEmails = new Set(members.map(m => m.email));
    const membersToAdd = newMembers.filter(nm => !existingEmails.has(nm.email));
    setMembers(prev => [...prev, ...membersToAdd]);
    addNotification({ type: 'success', title: 'Importation réussie', message: `${membersToAdd.length} nouveau(x) membre(s) ont été ajouté(s).` });
  };
  
  const handleResetData = () => {
    // This should be a backend call, but for now we reset to mock data for demonstration
    setMembers(MOCK_MEMBERS);
    setContributions(MOCK_CONTRIBUTIONS as any); // Type assertion for memberName
    setMessages(MOCK_MESSAGES);
    setEvents(MOCK_EVENTS);
    setPhotos(MOCK_PHOTOS);
    setRoles(MOCK_ROLES);
    setContributionTypes(MOCK_CONTRIBUTION_TYPES);
    setDocArticles(MOCK_DOC_ARTICLES);
    setNotifications([]);
    addNotification({ type: 'success', title: 'Réinitialisation terminée', message: 'Les données de démo ont été chargées.' });
  };

  const handleSearchResultClick = (item: Member | AppEvent | Contribution | DocArticle, type: keyof SearchResults) => {
    setGlobalSearchTerm('');
    setIsGlobalSearchFocused(false);
    switch(type) {
        case 'members': setCurrentPage('Membres'); break;
        case 'events': setCurrentPage('Événements'); break;
        case 'transactions': setCurrentPage('Finances'); break;
        case 'documentation':
            setCurrentPage('Documentation');
            setSelectedDocArticleId((item as DocArticle).id);
            break;
    }
  };

  // --- Page Rendering ---
  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard members={members} contributions={contributions} theme={theme} />;
      case 'Membres':
        return <Members members={members} roles={roles} onAddMember={handleAddMember} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} />;
      case 'Finances':
        return <Finances members={members} contributions={contributions} onAddContribution={handleAddContribution} theme={theme} />;
      case 'Cotisations':
        return <Cotisations members={members} contributionTypes={contributionTypes} onSaveType={handleSaveContributionType} onDeleteType={handleDeleteContributionType} onUpdateMemberContributions={handleUpdateMemberContributions} />;
      case 'Communication':
        return <Communication members={members} messages={messages} onSendMessage={handleSendMessage} roles={roles} />;
      case 'Événements':
        return <Events events={events} setEvents={setEvents} members={members} />;
      case 'Galerie':
        return <Galerie photos={photos} setPhotos={setPhotos} />;
      case 'Live':
        return <Live />;
      case 'Documentation':
        // FIX: Corrected a typo in the `Documentation` component prop, changing `selectedArticleId` to `selectedDocArticleId` to match the state variable name.
        return <Documentation articles={docArticles} onSaveArticle={handleSaveDocArticle} onDeleteArticle={handleDeleteDocArticle} selectedArticleId={selectedDocArticleId} setSelectedArticleId={setSelectedDocArticleId} />;
      case 'Paramètres':
        return <Settings userProfile={userProfile} setProfileModalOpen={setProfileModalOpen} theme={theme} toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} notificationPreferences={notificationPreferences} setNotificationPreferences={setNotificationPreferences} onResetData={handleResetData} onImportData={handleImportMembers} roles={roles} permissions={permissions} members={members} onSaveRole={handleSaveRole} onDeleteRole={handleDeleteRole} />;
      default:
        return <Dashboard members={members} contributions={contributions} theme={theme} />;
    }
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
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
          onLogout={() => setIsAuthenticated(false)} 
          theme={theme} 
          toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
          setSidebarOpen={setSidebarOpen} 
          setProfileModalOpen={setProfileModalOpen}
          globalSearchTerm={globalSearchTerm}
          setGlobalSearchTerm={setGlobalSearchTerm}
          globalSearchResults={globalSearchResults}
          onSearchResultClick={handleSearchResultClick}
          isGlobalSearchFocused={isGlobalSearchFocused}
          setIsGlobalSearchFocused={setIsGlobalSearchFocused}
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
