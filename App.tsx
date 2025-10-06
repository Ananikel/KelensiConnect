import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Finances from './components/Finances';
import Communication from './components/Communication';
import Events from './components/Events';
import Settings from './components/Settings';
import Header from './components/Header';
import Login from './components/Login';
import NotificationCenter from './components/NotificationCenter';
import { Page, Member, Contribution, UserProfile, ChatMessage, AppEvent, Notification } from './types';
import { MOCK_MEMBERS, MOCK_CONTRIBUTIONS, MOCK_MESSAGES, MOCK_EVENTS } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [contributions, setContributions] = useState<Contribution[]>(MOCK_CONTRIBUTIONS);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [events, setEvents] = useState<AppEvent[]>(MOCK_EVENTS);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('kelensi-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kelensi-theme', theme);
  }, [theme]);

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
  
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = { ...notification, id: Date.now() };
    setNotifications(prev => [...prev, newNotification]);
  };

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
          addNotification({
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
           addNotification({
            type: 'warning',
            title: 'Cotisations en attente',
            message: `${inactiveContributors.length} membre(s) actif(s) n'ont pas contribué récemment.`
          });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);


  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('Dashboard'); // Reset to default page on logout
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard members={members} contributions={contributions} theme={theme} />;
      case 'Membres':
        return <Members members={members} setMembers={setMembers} />;
      case 'Finances':
        return <Finances members={members} contributions={contributions} setContributions={setContributions} theme={theme} />;
      case 'Communication':
        return <Communication members={members} messages={messages} setMessages={setMessages} />;
       case 'Événements':
        return <Events events={events} setEvents={setEvents} members={members} />;
       case 'Paramètres':
        return <Settings />;
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
    Paramètres: 'Paramètres',
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <NotificationCenter notifications={notifications} removeNotification={removeNotification} />
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={pageTitles[currentPage]} 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-6 md:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;