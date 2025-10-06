
import React, { useState, useRef, useEffect } from 'react';
import SearchIcon from './icons/SearchIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import LogoutIcon from './icons/LogoutIcon';
import { UserProfile } from '../types';
import UserIcon from './icons/UserIcon';
import ProfileModal from './ProfileModal';

interface HeaderProps {
    title: string;
    userProfile: UserProfile;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, userProfile, setUserProfile, onLogout }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
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
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-6 md:px-8 z-10">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
            </div>
            <div className="relative" ref={dropdownRef}>
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setDropdownOpen(prev => !prev)}>
                  <img 
                    src={userProfile.avatar}
                    alt="Admin Avatar" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="hidden md:flex items-center">
                    <span className="font-medium text-gray-700">{userProfile.name}</span>
                    <ChevronDownIcon />
                  </div>
                </div>
                {isDropdownOpen && (
                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                        <button 
                            onClick={() => {
                              setProfileModalOpen(true);
                              setDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <UserIcon />
                            <span className="ml-2">Mon Profil</span>
                        </button>
                        <button 
                            onClick={onLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <LogoutIcon />
                            <span className="ml-2">Se déconnecter</span>
                        </button>
                     </div>
                )}
            </div>
          </div>
        </header>
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
    </>
  );
};

export default Header;
