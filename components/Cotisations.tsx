import React, { useState, useMemo } from 'react';
import { Member, ContributionType } from '../types';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import CloseIcon from './icons/CloseIcon';
import SearchIcon from './icons/SearchIcon';
import Pagination from './Pagination';

interface CotisationsProps {
    members: Member[];
    contributionTypes: ContributionType[];
    onSaveType: (type: ContributionType) => void;
    onDeleteType: (typeId: string) => void;
    onUpdateMemberContributions: (memberId: number, typeIds: string[]) => void;
}

const ITEMS_PER_PAGE = 10;

const Cotisations: React.FC<CotisationsProps> = ({ members, contributionTypes, onSaveType, onDeleteType, onUpdateMemberContributions }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modals state
    const [isTypeModalOpen, setTypeModalOpen] = useState(false);
    const [typeToEdit, setTypeToEdit] = useState<ContributionType | null>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<ContributionType | null>(null);
    const [isAssignmentModalOpen, setAssignmentModalOpen] = useState(false);
    const [memberToAssign, setMemberToAssign] = useState<Member | null>(null);

    const isTypeInUse = (typeId: string): boolean => {
        return members.some(m => m.contributionTypeIds?.includes(typeId));
    };
    
    const filteredMembers = useMemo(() => {
        return members.filter(member => member.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [members, searchTerm]);

    const paginatedMembers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredMembers, currentPage]);
    
    const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);

    const openTypeModal = (type: ContributionType | null = null) => {
        setTypeToEdit(type);
        setTypeModalOpen(true);
    };

    const openDeleteModal = (type: ContributionType) => {
        setTypeToDelete(type);
        setDeleteModalOpen(true);
    };

    const openAssignmentModal = (member: Member) => {
        setMemberToAssign(member);
        setAssignmentModalOpen(true);
    };

    const contributionTypeMap = useMemo(() => {
        return new Map(contributionTypes.map(type => [type.id, type]));
    }, [contributionTypes]);

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Types de Cotisation</h3>
                    <button onClick={() => openTypeModal()} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <PlusIcon />
                        <span className="ml-2 hidden sm:inline">Ajouter un type</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                         <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nom</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fréquence</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {contributionTypes.map(type => (
                                <tr key={type.id}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <p className="font-medium text-gray-900 dark:text-gray-200">{type.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">{type.amount.toLocaleString('fr-FR')} CFA</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{type.frequency}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => openTypeModal(type)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" aria-label="Modifier"><EditIcon/></button>
                                            <button onClick={() => openDeleteModal(type)} disabled={isTypeInUse(type.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:text-gray-400 disabled:cursor-not-allowed" aria-label="Supprimer"><DeleteIcon/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Assignation aux Membres</h3>
                    <div className="relative w-full md:w-auto">
                        <input type="text" placeholder="Rechercher un membre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-72 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Membre</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cotisations Assignées</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedMembers.map(member => (
                                <tr key={member.id}>
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">{member.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-2">
                                            {member.contributionTypeIds && member.contributionTypeIds.length > 0 ? (
                                                member.contributionTypeIds.map(id => {
                                                    const type = contributionTypeMap.get(id);
                                                    return type ? <span key={id} className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">{type.name}</span> : null;
                                                })
                                            ) : <span className="text-xs text-gray-500 dark:text-gray-400">Aucune</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <button onClick={() => openAssignmentModal(member)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center text-sm">
                                            <EditIcon /> <span className="ml-2">Gérer</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            {isTypeModalOpen && <TypeModal type={typeToEdit} onSave={onSaveType} onClose={() => setTypeModalOpen(false)} />}
            {isDeleteModalOpen && typeToDelete && <DeleteModal type={typeToDelete} onConfirm={onDeleteType} onClose={() => setDeleteModalOpen(false)} />}
            {isAssignmentModalOpen && memberToAssign && <AssignmentModal member={memberToAssign} allTypes={contributionTypes} onSave={onUpdateMemberContributions} onClose={() => setAssignmentModalOpen(false)} />}
        </div>
    );
};

// --- Modals ---

const TypeModal: React.FC<{ type: ContributionType | null; onSave: (data: ContributionType) => void; onClose: () => void }> = ({ type, onSave, onClose }) => {
    const [name, setName] = useState(type?.name || '');
    const [amount, setAmount] = useState<number | ''>(type?.amount || '');
    const [frequency, setFrequency] = useState<'Unique' | 'Mensuelle' | 'Trimestrielle' | 'Annuelle'>(type?.frequency || 'Annuelle');
    const [description, setDescription] = useState(type?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || amount === '' || amount <= 0) return;
        const id = type?.id || name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        onSave({ id, name, amount, frequency, description });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold">{type ? 'Modifier le Type' : 'Ajouter un Type'}</h3>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du type</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant (CFA)</label>
                            <input id="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                        </div>
                        <div>
                             <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fréquence</label>
                            <select id="frequency" value={frequency} onChange={e => setFrequency(e.target.value as any)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                <option>Unique</option>
                                <option>Mensuelle</option>
                                <option>Trimestrielle</option>
                                <option>Annuelle</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteModal: React.FC<{ type: ContributionType; onConfirm: (id: string) => void; onClose: () => void }> = ({ type, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
                <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Êtes-vous sûr de vouloir supprimer <strong>"{type.name}"</strong> ?</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 rounded-md border border-gray-300 dark:border-gray-500">Annuler</button>
                <button type="button" onClick={() => { onConfirm(type.id); onClose(); }} className="px-4 py-2 bg-red-600 text-white rounded-md">Supprimer</button>
            </div>
        </div>
    </div>
);

const AssignmentModal: React.FC<{ member: Member; allTypes: ContributionType[]; onSave: (memberId: number, typeIds: string[]) => void; onClose: () => void }> = ({ member, allTypes, onSave, onClose }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(member.contributionTypeIds || []));

    const handleToggle = (typeId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(typeId)) newSet.delete(typeId);
            else newSet.add(typeId);
            return newSet;
        });
    };

    const handleSave = () => {
        onSave(member.id, Array.from(selectedIds));
        onClose();
    };
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
                <div className="flex-shrink-0 flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Assigner à {member.name}</h3>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {allTypes.map(type => (
                        <label key={type.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            <input type="checkbox" checked={selectedIds.has(type.id)} onChange={() => handleToggle(type.id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-gray-800 dark:text-gray-200">{type.name}</span>
                        </label>
                    ))}
                     {allTypes.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">Aucun type de cotisation n'a été créé.</p>}
                </div>
                <div className="flex-shrink-0 mt-auto bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Annuler</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Enregistrer</button>
                </div>
            </div>
        </div>
    );
};


export default Cotisations;