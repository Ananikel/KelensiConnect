
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Finances from './components/Finances';
import Communication from './components/Communication';
import Header from './components/Header';
import Login from './components/Login';
import { Page, Member, Contribution, UserProfile } from './types';
import { MOCK_MEMBERS, MOCK_CONTRIBUTIONS } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [contributions, setContributions] = useState<Contribution[]>(MOCK_CONTRIBUTIONS);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    try {
      window.localStorage.setItem('kelensi-user-profile', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil dans localStorage', error);
    }
  }, [userProfile]);


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
        return <Dashboard members={members} contributions={contributions} />;
      case 'Membres':
        return <Members members={members} setMembers={setMembers} />;
      case 'Finances':
        return <Finances members={members} contributions={contributions} setContributions={setContributions} />;
      case 'Communication':
        return <Communication />;
      default:
        return <Dashboard members={members} contributions={contributions} />;
    }
  };
  
  const pageTitles: Record<Page, string> = {
    Dashboard: 'Tableau de Bord',
    Membres: 'Gestion des Membres',
    Finances: 'Suivi Financier',
    Communication: 'Communication Interne',
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={pageTitles[currentPage]} 
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          onLogout={handleLogout} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
