import React from 'react';
import { Role } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface RolesPermissionsProps {
    roles: Role[];
    onBack: () => void;
}

const RolesPermissions: React.FC<RolesPermissionsProps> = ({ roles, onBack }) => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center">
                 <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-4">
                    <ArrowLeftIcon />
                </button>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Rôles & Permissions</h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400">
                Voici la liste des rôles définis pour votre association. La gestion détaillée des permissions pour chaque rôle sera disponible prochainement.
            </p>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                 <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {roles.map(role => (
                        <li key={role.id} className="p-5">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{role.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{role.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default RolesPermissions;
