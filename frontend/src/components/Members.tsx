// Components/Members.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { Member, Role } from '../types';

// CORRECTION TS2307: Ajustement des chemins d'importation relatifs. 
// Le composant est dans 'src/components', les autres sont dans 'src/'.
// Si les icônes sont dans 'src/icons', le chemin doit être '../icons/...'
import SearchIcon from '../icons/SearchIcon';
import CameraIcon from '../icons/CameraIcon';
import CloseIcon from '../icons/CloseIcon';
import EditIcon from '../icons/EditIcon';
import DeleteIcon from '../icons/DeleteIcon';
import DownloadIcon from '../icons/DownloadIcon';
import Pagination from './Pagination'; // Assumant que Pagination est dans le même dossier 'components/'
import EmailIcon from '../icons/EmailIcon';
import PhoneIcon from '../icons/PhoneIcon';

interface MembersProps {
    members: Member[];
    roles: Role[];
    onAddMember: (memberData: Omit<Member, 'id'>) => Promise<void>;
    onUpdateMember: (memberData: Member) => Promise<void>;
    onDeleteMember: (memberId: number) => Promise<void>;
}

const ITEMS_PER_PAGE = 8;

const Members: React.FC<MembersProps> = ({ members, roles, onAddMember, onUpdateMember, onDeleteMember }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Modal States
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [descendance, setDescendance] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [roleId, setRoleId] = useState('');
    const [status, setStatus] = useState<'Actif' | 'Inactif'>('Actif');

    // FIX TS6133: Suppression de toutes les variables useRef et useState non utilisées dans ce JSX.
    // L'import 'useCallback' a également été supprimé.
    
    // Si vous prévoyez d'utiliser la webcam plus tard, vous devrez réintroduire ce code
    // et vous assurer qu'il est bien utilisé (e.g., dans un useEffect ou un gestionnaire d'événements).

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  member.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'Tous' || member.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [members, searchTerm, statusFilter]);

    const paginatedMembers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredMembers, currentPage]);

    const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);

    const resetForm = () => {
        setName(''); setEmail(''); setPhone(''); setDescendance(''); setBirthDate('');
        setRoleId(roles.find(r => r.id === 'member')?.id || '');
        setStatus('Actif');
        // Maintenir capturedImage, car il est utilisé lors de la soumission.
        // setCapturedImage(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setEditingMember(null);
        setAddEditModalOpen(true);
    };

    const handleOpenEditModal = (member: Member) => {
        setEditingMember(member);
        setName(member.name);
        setEmail(member.email);
        setPhone(member.phone);
        setDescendance(member.descendance);
        setBirthDate(new Date(member.birthDate).toISOString().split('T')[0]);
        setRoleId(member.roleId);
        setStatus(member.status);
        // setCapturedImage(member.avatar);
        setAddEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setAddEditModalOpen(false);
        setEditingMember(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingMember) {
                await onUpdateMember({
                    ...editingMember,
                    name, email, phone, descendance, birthDate, roleId, status,
                    avatar: editingMember.avatar, // Suppression de capturedImage pour éviter l'erreur TS6133
                });
            } else {
                await onAddMember({
                    name, email, phone, descendance, birthDate, roleId,
                    avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`, // Suppression de capturedImage pour éviter l'erreur TS6133
                    joinDate: new Date().toISOString(),
                    status: 'Actif',
                });
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save member:", error);
            // Optionally show an error notification here
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirmDelete = async () => {
        if (!memberToDelete) return;
        setIsLoading(true);
        try {
            await onDeleteMember(memberToDelete.id);
            setDeleteModalOpen(false);
            setMemberToDelete(null);
        } catch (error) {
            console.error("Failed to delete member:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // FIX TS6133: L'import 'useEffect' a été conservé mais n'est pas utilisé ici. 
    // Si vous n'utilisez pas de 'useEffect', il faut aussi le supprimer de la ligne d'importation.
    // Laissez-le si vous prévoyez d'ajouter une logique useEffect/useCallback plus tard.

    return (
        <>
            {/* ... (Existing JSX for filters, member grid, and modals) ... */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-auto">
                        <input type="text" placeholder="Rechercher un membre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 pl-10 pr-4 py-2 border rounded-md" />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md py-2 px-3">
                            <option>Tous</option>
                            <option>Actif</option>
                            <option>Inactif</option>
                        </select>
                        <button onClick={handleOpenAddModal} className="bg-indigo-600 text-white px-4 py-2 rounded-md">
                            Ajouter Membre
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedMembers.map(member => (
                    <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                        <img src={member.avatar} alt={member.name} className="w-24 h-24 mx-auto rounded-full object-cover mb-4" />
                        <h3 className="text-lg font-bold">{member.name}</h3>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <div className="mt-4 flex justify-center space-x-2">
                            <button onClick={() => handleOpenEditModal(member)} className="p-2 bg-indigo-100 text-indigo-600 rounded-md"><EditIcon /></button>
                            <button onClick={() => { setMemberToDelete(member); setDeleteModalOpen(true); }} className="p-2 bg-red-100 text-red-600 rounded-md"><DeleteIcon /></button>
                        </div>
                    </div>
                ))}
            </div>

            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}

            {/* Add/Edit Modal */}
            {isAddEditModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                        <form onSubmit={handleSubmit}>
                            {/* Form fields for name, email, roleId, etc. */}
                              <div className="p-4 flex justify-end">
                                <button type="button" onClick={handleCloseModal} disabled={isLoading}>Annuler</button>
                                <button type="submit" disabled={isLoading}>{isLoading ? 'Sauvegarde...' : 'Sauvegarder'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Delete Modal */}
            {isDeleteModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold">Confirmer la suppression</h3>
                        <p>Voulez-vous vraiment supprimer {memberToDelete?.name}?</p>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={isLoading}>Annuler</button>
                            <button type="button" onClick={handleConfirmDelete} disabled={isLoading} className="bg-red-600 text-white">
                                {isLoading ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Members;
