import React, { useState } from 'react';
import SearchIcon from '../icons/SearchIcon'; // <-- CORRIGÉ
import PlusIcon from '../icons/PlusIcon'; // <-- CORRIGÉ
import CloseIcon from '../icons/CloseIcon'; // <-- CORRIGÉ

// Assurez-vous que le type CommunicationItem est défini dans '../types'
interface CommunicationItem {
    id: number;
    title: string;
    date: string;
    // ... autres propriétés
}

interface CommunicationProps {
    communications: CommunicationItem[];
    theme: 'light' | 'dark';
}

const Communication: React.FC<CommunicationProps> = ({ communications, theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Logique de filtrage simple
    const filteredCommunications = communications.filter(comm => 
        comm.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isDark = theme === 'dark';
    const baseClasses = isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900';
    const inputClasses = isDark ? 'dark:bg-gray-700 dark:text-white dark:border-gray-600' : 'bg-white border-gray-300';

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Centre de Communication</h1>
            
            <div className={`${baseClasses} p-6 rounded-lg shadow-md`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="relative flex-grow mr-4">
                        <input
                            type="text"
                            placeholder="Rechercher une communication..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${inputClasses}`}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <button className="bg-indigo-600 text-white p-3 rounded-md shadow-lg hover:bg-indigo-700 transition-colors flex items-center">
                        <PlusIcon className="w-5 h-5 mr-1" /> Nouvel Événement
                    </button>
                </div>

                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    {filteredCommunications.length > 0 ? (
                        <div className="space-y-4">
                            {/* Rendre la liste des communications ici */}
                            {filteredCommunications.map(comm => (
                                <div key={comm.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <h3 className="font-semibold text-lg">{comm.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Date: {new Date(comm.date).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            Aucune communication trouvée.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Communication;
