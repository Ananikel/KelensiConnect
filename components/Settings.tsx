import React, { useState } from 'react';
import { UserProfile, NotificationPreferences } from '../types';
import UserIcon from './icons/UserIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import BellIcon from './icons/BellIcon';
import DatabaseIcon from './icons/DatabaseIcon';

interface SettingsProps {
    userProfile: UserProfile;
    setProfileModalOpen: (isOpen: boolean) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    notificationPreferences: NotificationPreferences;
    setNotificationPreferences: React.Dispatch<React.SetStateAction<NotificationPreferences>>;
    onResetData: () => void;
}

const SettingsCard: React.FC<{ title: string; description: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, description, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 text-indigo-600 dark:text-indigo-400">{icon}</div>
                <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                </div>
            </div>
        </div>
        <div className="p-5 bg-gray-50 dark:bg-gray-800/50">
            {children}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string; description: string; }> = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between">
        <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">{label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <button
            type="button"
            className={`${enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800`}
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
        >
            <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
        </button>
    </div>
);


const Settings: React.FC<SettingsProps> = ({ userProfile, setProfileModalOpen, theme, toggleTheme, notificationPreferences, setNotificationPreferences, onResetData }) => {
    
    const [isResetModalOpen, setResetModalOpen] = useState(false);

    const handleToggleNotification = (key: keyof NotificationPreferences) => {
        setNotificationPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleConfirmReset = () => {
        onResetData();
        setResetModalOpen(false);
    };

    return (
        <>
            <div className="space-y-8 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Paramètres</h2>
                
                <SettingsCard
                    title="Profil"
                    description="Gérez les informations de votre profil administrateur."
                    icon={<UserIcon />}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <img src={userProfile.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                            <span className="ml-4 font-semibold text-gray-800 dark:text-gray-200">{userProfile.name}</span>
                        </div>
                        <button onClick={() => setProfileModalOpen(true)} className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Modifier
                        </button>
                    </div>
                </SettingsCard>

                <SettingsCard
                    title="Apparence"
                    description="Personnalisez l'apparence de l'application."
                    icon={theme === 'light' ? <SunIcon/> : <MoonIcon/>}
                >
                     <div className="flex items-center justify-between">
                         <p className="font-medium text-gray-700 dark:text-gray-300">Thème</p>
                         <div className="flex items-center space-x-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                            <button onClick={() => theme === 'dark' && toggleTheme()} className={`px-3 py-1 text-sm rounded-md flex items-center space-x-2 ${theme === 'light' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>
                                <SunIcon /> <span>Clair</span>
                            </button>
                            <button onClick={() => theme === 'light' && toggleTheme()} className={`px-3 py-1 text-sm rounded-md flex items-center space-x-2 ${theme === 'dark' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>
                                <MoonIcon/> <span>Sombre</span>
                            </button>
                         </div>
                    </div>
                </SettingsCard>

                <SettingsCard
                    title="Notifications"
                    description="Choisissez les notifications automatiques que vous souhaitez recevoir."
                    icon={<BellIcon />}
                >
                    <div className="space-y-4">
                        <ToggleSwitch
                            label="Événements à venir"
                            description="Recevoir un rappel pour les événements dans les 7 prochains jours."
                            enabled={notificationPreferences.upcomingEvents}
                            onChange={() => handleToggleNotification('upcomingEvents')}
                        />
                        <ToggleSwitch
                            label="Cotisations en attente"
                            description="Être notifié si des membres actifs n'ont pas cotisé récemment."
                            enabled={notificationPreferences.pendingContributions}
                            onChange={() => handleToggleNotification('pendingContributions')}
                        />
                    </div>
                </SettingsCard>

                 <SettingsCard
                    title="Données de l'application"
                    description="Gérez les données de votre association."
                    icon={<DatabaseIcon />}
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                        <p className="font-medium text-gray-700 dark:text-gray-300">Réinitialiser les données</p>
                        <button onClick={() => setResetModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            Réinitialiser l'application
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Attention : Cette action supprimera toutes les données actuelles et les remplacera par les données de démonstration. Cette action est irréversible.</p>
                </SettingsCard>
            </div>

            {isResetModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                         <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Confirmer la réinitialisation</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Êtes-vous sûr de vouloir réinitialiser toutes les données de l'application ? Cette action est irréversible et remplacera toutes les données actuelles par les données de démonstration.
                            </p>
                         </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                            <button type="button" onClick={() => setResetModalOpen(false)} className="bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Annuler</button>
                            <button type="button" onClick={handleConfirmReset} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Confirmer et Réinitialiser</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Settings;
