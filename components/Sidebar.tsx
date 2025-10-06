import React from 'react';
import { Page } from '../types';
import DashboardIcon from './icons/DashboardIcon';
import MembersIcon from './icons/MembersIcon';
import FinancesIcon from './icons/FinancesIcon';
import CommunicationIcon from './icons/CommunicationIcon';
import EventsIcon from './icons/EventsIcon';
import SettingsIcon from './icons/SettingsIcon';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  // FIX: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const navItems: { name: Page; icon: React.ReactElement }[] = [
    { name: 'Dashboard', icon: <DashboardIcon /> },
    { name: 'Membres', icon: <MembersIcon /> },
    { name: 'Finances', icon: <FinancesIcon /> },
    { name: 'Événements', icon: <EventsIcon /> },
    { name: 'Communication', icon: <CommunicationIcon /> },
    { name: 'Paramètres', icon: <SettingsIcon /> },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex flex-col shadow-lg">
      <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-indigo-600">KelensiConnect</h1>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(item.name);
                }}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  currentPage === item.name
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400'
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
    </div>
  );
};

export default Sidebar;