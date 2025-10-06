import React from 'react';
import { Page } from '../types';
import DashboardIcon from './icons/DashboardIcon';
import MembersIcon from './icons/MembersIcon';
import FinancesIcon from './icons/FinancesIcon';
import CommunicationIcon from './icons/CommunicationIcon';
import EventsIcon from './icons/EventsIcon';
import SettingsIcon from './icons/SettingsIcon';
import CloseIcon from './icons/CloseIcon';
import GalleryIcon from './icons/GalleryIcon';
import DocumentationIcon from './icons/DocumentationIcon';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen }) => {
  const navItems: { name: Page; icon: React.ReactElement }[] = [
    { name: 'Dashboard', icon: <DashboardIcon /> },
    { name: 'Membres', icon: <MembersIcon /> },
    { name: 'Finances', icon: <FinancesIcon /> },
    { name: 'Événements', icon: <EventsIcon /> },
    { name: 'Communication', icon: <CommunicationIcon /> },
    { name: 'Galerie', icon: <GalleryIcon /> },
    { name: 'Documentation', icon: <DocumentationIcon /> },
    { name: 'Paramètres', icon: <SettingsIcon /> },
  ];

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">KelensiConnect</h1>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white" aria-label="Fermer le menu">
            <CloseIcon />
        </button>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.name);
                }}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 ${
                  currentPage === item.name
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                <span className="w-6 h-6 mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
         <p className="text-xs text-gray-400 dark:text-gray-500 text-center">&copy; 2024 KelensiConnect. Tous droits réservés.</p>
      </div>
    </aside>
  );
};

export default Sidebar;