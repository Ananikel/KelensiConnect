import React, { useState, useRef, useEffect } from 'react';
import SearchIcon from './icons/SearchIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import LogoutIcon from './icons/LogoutIcon';
import { UserProfile } from '../types';
import UserIcon from './icons/UserIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import MenuIcon from './icons/MenuIcon';

interface HeaderProps {
    title: string;
    userProfile: UserProfile;
    onLogout: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setProfileModalOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ title, userProfile, onLogout, theme, toggleTheme, setSidebarOpen, setProfileModalOpen }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <>
        <header className="bg-white dark:bg-gray-800 shadow-sm h-20 flex items-center justify-between px-4 sm:px-6 md:px-8 z-10 flex-shrink-0">
          <div className="flex items-center">
            <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 mr-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Ouvrir le menu"
            >
                <MenuIcon />
            </button>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 truncate">{title}</h2>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-48 lg:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 dark:placeholder-gray-400"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
            </div>
            
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                aria-label="Changer de thème"
            >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            <div className="relative" ref={dropdownRef}>
                <button 
                  type="button" 
                  className="flex items-center space-x-3 cursor-pointer rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800" 
                  onClick={() => setDropdownOpen(prev => !prev)}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                  aria-label="Ouvrir le menu utilisateur"
                >
                  <img 
                    src={userProfile.avatar}
                    alt="Admin Avatar" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="hidden md:flex items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{userProfile.name}</span>
                    <ChevronDownIcon />
                  </div>
                </button>
                {isDropdownOpen && (
                     <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black dark:ring-gray-700 ring-opacity-5">
                        <button 
                            onClick={() => {
                              setProfileModalOpen(true);
                              setDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                        >
                            <UserIcon />
                            <span className="ml-2">Mon Profil</span>
                        </button>
                        <button 
                            onClick={onLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                        >
                            <LogoutIcon />
                            <span className="ml-2">Se déconnecter</span>
                        </button>
                     </div>
                )}
            </div>
          </div>
        </header>
    </>
  );
};

export default Header;
