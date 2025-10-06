
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
// FIX: Imported the 'Photo' type to resolve the 'Cannot find name' error.
import { Page, Member, Contribution, UserProfile, ChatMessage, AppEvent, Notification, NotificationPreferences, Role, Permission, Photo } from './types';
import { MOCK_MEMBERS, MOCK_CONTRIBUTIONS, MOCK_MESSAGES, MOCK_EVENTS, MOCK_PHOTOS, MOCK_ROLES, MOCK_PERMISSIONS } from './constants';
import ProfileModal from './components/ProfileModal';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [contributions, setContributions] = useState<Contribution[]>(MOCK_CONTRIBUTIONS);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [events, setEvents] = useState<AppEvent[]>(MOCK_EVENTS);
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [permissions, setPermissions] = useState<Permission[]>(MOCK_PERMISSIONS);
  
  // State for Settings
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('kelensi-notif-prefs');
      return saved ? JSON.parse(saved) : { upcomingEvents: true, pendingContributions: true };
    } catch (error) {
      console.error('Erreur lors de la lecture des préférences de notification', error);
      return { upcomingEvents: true, pendingContributions: true };
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('kelensi-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Lifted state for Profile Modal
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kelensi-theme', theme);
  }, [theme]);
  
  // Persist notification preferences
  useEffect(() => {
    localStorage.setItem('kelensi-notif-prefs', JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  const toggleTheme = () => {
      setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const getInitialProfile = (): UserProfile => {
    try {
      const item = window.localStorage.getItem('kelensi-user-profile');
      return item ? JSON.parse(item) : { name: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff' };
    } catch (error) {
      console.error('Erreur lors de la lecture du profil depuis localStorage', error);
      return { name: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff' };
    }
  };

  const [userProfile, setUserProfile] = useState<UserProfile>(getInitialProfile);
  
  useEffect(() => {
    const handleResize = () => {
        // Close sidebar automatically on window resize to desktop
        if (window.innerWidth >= 768 && isSidebarOpen) {
            setSidebarOpen(false);
        }
    };

    window.addEventListener('resize', handleResize);

    // Prevent body from scrolling when mobile sidebar is open
    if (isSidebarOpen && window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }

    // Cleanup function to restore scroll on component unmount
    return () => {
        window.removeEventListener('resize', handleResize);
        document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification = { ...notification, id: Date.now() };
    setNotifications(prev => [...prev, newNotification]);
  }, []);
  
  const addNotificationWithPreferences = useCallback((type: keyof NotificationPreferences, notification: Omit<Notification, 'id'>) => {
    if (notificationPreferences[type]) {
      addNotification(notification);
    }
  }, [notificationPreferences, addNotification]);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  useEffect(() => {
    try {
      window.localStorage.setItem('kelensi-user-profile', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil dans localStorage', error);
    }
  }, [userProfile]);

  useEffect(() => {
    if (isAuthenticated) {
      // Check for upcoming events
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      events.forEach(event => {
        const eventDate = new Date(event.date);
        if (eventDate >= today && eventDate <= nextWeek) {
          addNotificationWithPreferences('upcomingEvents', {
            type: 'info',
            title: 'Événement à venir',
            message: `N'oubliez pas : "${event.title}" le ${eventDate.toLocaleDateString('fr-FR')}.`
          });
        }
      });
      
      // Check for members with no recent contributions
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      
      const activeMembers = members.filter(m => m.status === 'Actif');
      const membersWithRecentContributions = new Set(
        contributions
          .filter(c => new Date(c.date) > sixMonthsAgo)
          .map(c => c.memberId)
      );

      const inactiveContributors = activeMembers.filter(m => !membersWithRecentContributions.has(m.id));

      if(inactiveContributors.length > 0) {
           addNotificationWithPreferences('pendingContributions', {
            type: 'warning',
            title: 'Cotisations en attente',
            message: `${inactiveContributors.length} membre(s) actif(s) n'ont pas contribué récemment.`
          });
      }
    }
  }, [isAuthenticated, events, members, contributions, addNotificationWithPreferences]);


  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('Dashboard'); // Reset to default page on logout
  };

  const handleResetData = () => {
    setMembers(MOCK_MEMBERS);
    setContributions(MOCK_CONTRIBUTIONS);
    setMessages(MOCK_MESSAGES);
    setEvents(MOCK_EVENTS);
    setPhotos(MOCK_PHOTOS);
    setRoles(MOCK_ROLES);
    setNotifications([]);
    addNotification({ type: 'success', title: 'Réinitialisation terminée', message: 'Les données de l\'application ont été réinitialisées.' });
  };

  const handleImportMembers = (newMembers: Member[]) => {
    const existingEmails = new Set(members.map(m => m.email));
    const membersToAdd = newMembers.filter(nm => !existingEmails.has(nm.email));

    setMembers(prev => [...prev, ...membersToAdd]);
    
    addNotification({ 
        type: 'success', 
        title: 'Importation réussie', 
        message: `${membersToAdd.length} nouveau(x) membre(s) ont été ajouté(s).` 
    });

     if (newMembers.length > membersToAdd.length) {
         addNotification({
             type: 'info',
             title: 'Doublons ignorés',
             message: `${newMembers.length - membersToAdd.length} membre(s) ont été ignorés car leur email existait déjà.`
         });
     }
  };

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


  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard members={members} contributions={contributions} theme={theme} />;
      case 'Membres':
        return <Members members={members} setMembers={setMembers} roles={roles} />;
      case 'Finances':
        return <Finances members={members} contributions={contributions} setContributions={setContributions} theme={theme} />;
      case 'Communication':
        return <Communication members={members} messages={messages} setMessages={setMessages} roles={roles} />;
       case 'Événements':
        return <Events events={events} setEvents={setEvents} members={members} />;
       case 'Galerie':
        return <Galerie photos={photos} setPhotos={setPhotos} />;
       case 'Live':
        return <Live />;
       case 'Documentation':
        return <Documentation />;
       case 'Paramètres':
        return <Settings 
                 userProfile={userProfile}
                 setProfileModalOpen={setProfileModalOpen}
                 theme={theme}
                 toggleTheme={toggleTheme}
                 notificationPreferences={notificationPreferences}
                 setNotificationPreferences={setNotificationPreferences}
                 onResetData={handleResetData}
                 onImportData={handleImportMembers}
                 roles={roles}
                 permissions={permissions}
                 members={members}
                 onSaveRole={handleSaveRole}
                 onDeleteRole={handleDeleteRole}
               />;
      default:
        return <Dashboard members={members} contributions={contributions} theme={theme} />;
    }
  };
  
  const pageTitles: Record<Page, string> = {
    Dashboard: 'Tableau de Bord',
    Membres: 'Gestion des Membres',
    Finances: 'Suivi Financier',
    Communication: 'Messagerie',
    Événements: 'Gestion des Événements',
    Galerie: 'Galerie de Photos',
    Live: 'Session Live',
    Documentation: 'Documentation',
    Paramètres: 'Paramètres',
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="relative min-h-screen md:flex bg-gray-100 dark:bg-gray-900 font-sans">
      <NotificationCenter notifications={notifications} removeNotification={removeNotification} />
      
      {/* Mobile Overlay */}
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
          toggleTheme={toggleTheme}
          setSidebarOpen={setSidebarOpen}
          setProfileModalOpen={setProfileModalOpen}
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
