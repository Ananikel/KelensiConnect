import React, { useState, useMemo, useEffect } from 'react';
import { Member, Role } from '../types';
import SearchIcon from '../icons/SearchIcon';
import CameraIcon from '../icons/CameraIcon';
import CloseIcon from '../icons/CloseIcon';
import EditIcon from '../icons/EditIcon';
import DeleteIcon from '../icons/DeleteIcon';
import DownloadIcon from '../icons/DownloadIcon';
import PlusIcon from '../icons/PlusIcon'; // <-- AJOUTÉ
import Pagination from './Pagination'; 
import EmailIcon from '../icons/EmailIcon';
import PhoneIcon from '../icons/PhoneIcon';

interface MembersProps {
    members: Member[];
    roles: Role[];
    onAddMember: (memberData: Omit<Member, 'id'>) => Promise<void>;
    onUpdateMember: (memberData: Member) => Promise<void>;
    onDeleteMember: (memberId: number) => Promise<void>;
    theme: 'light' | 'dark'; // Ajouté pour la cohérence
}

const ITEMS_PER_PAGE = 8;

const Members: React.FC<MembersProps> = ({ members, roles, onAddMember, onUpdateMember, onDeleteMember, theme }) => {
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
        setAddEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setAddEditModalOpen(false);
        setEditingMember(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simple validation
        if (!name || !email || !roleId) {
             alert("Veuillez remplir les champs Nom, Email et Rôle.");
             setIsLoading(false);
             return;
        }

        try {
            if (editingMember) {
                // Logic for updating an existing member
                await onUpdateMember({
                    ...editingMember,
                    name, email, phone, descendance, birthDate, roleId, status,
                    avatar: editingMember.avatar, 
                });
            } else {
                // Logic for adding a new member
                await onAddMember({
                    name, email, phone, descendance, birthDate, roleId,
                    avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`, 
                    status: 'Actif',
                    // joinDate est RETIRÉ d'ici pour que App.tsx le fournisse et corrige l'erreur de typage
                } as Omit<Member, 'id'>); // Casting pour s'aligner sur la correction
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save member:", error);
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

    // ... (Reste du JSX)
    const baseClasses = "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";
    const inputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-200";

    const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'Inconnu';

    return (
        <>
            <div className="space-y-6">
                <div className={`${baseClasses} p-6 rounded-lg shadow-md mb-6`}>
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div className="relative w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Rechercher un membre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full md:w-80 pl-10 pr-4 py-2 border rounded-md ${inputClasses}`}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={`border rounded-md py-2 px-3 ${inputClasses}`}
                            >
                                <option>Tous</option>
                                <option>Actif</option>
                                <option>Inactif</option>
                            </select>
                            <button onClick={handleOpenAddModal} className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-700 transition-colors flex items-center">
                                <PlusIcon className="w-5 h-5 mr-2" /> Ajouter Membre
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedMembers.map(member => (
                        <div key={member.id} className={`${baseClasses} rounded-lg shadow-lg overflow-hidden flex flex-col`}>
                            <div className="relative h-24 bg-indigo-500/20 flex items-center justify-center">
                                <img 
                                    src={member.avatar || `https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&background=4f46e5&color=fff`} 
                                    alt={member.name} 
                                    className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 object-cover absolute bottom-[-40px]" 
                                />
                            </div>
                            <div className="pt-12 p-4 text-center flex-grow">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 truncate">{member.name}</h3>
                                <p className={`mt-1 text-sm font-medium ${member.status === 'Actif' ? 'text-green-500' : 'text-red-500'}`}>
                                    {member.status}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{getRoleName(member.roleId)}</p>
                                
                                <div className="mt-4 text-left space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <p className="flex items-center">
                                        <EmailIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                        <span className="truncate">{member.email}</span>
                                    </p>
                                    <p className="flex items-center">
                                        <PhoneIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                        <span>{member.phone || 'Non spécifié'}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => handleOpenEditModal(member)}
                                    className="flex-1 p-3 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center border-r dark:border-gray-700"
                                >
                                    <EditIcon className="w-4 h-4 mr-1" /> Modifier
                                </button>
                                <button
                                    onClick={() => { setMemberToDelete(member); setDeleteModalOpen(true); }}
                                    className="flex-1 p-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                                >
                                    <DeleteIcon className="w-4 h-4 mr-1" /> Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* Add/Edit Modal */}
            {isAddEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${baseClasses} rounded-lg shadow-xl w-full max-w-lg p-6`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">{editingMember ? 'Modifier Membre' : 'Ajouter Nouveau Membre'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Nom Complet" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} required />
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} required />
                            <input type="tel" placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
                            
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de Naissance</label>
                            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClasses} required />
                            
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
                            <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className={inputClasses} required>
                                <option value="">Sélectionner un rôle</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>

                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value as 'Actif' | 'Inactif')} className={inputClasses} required>
                                <option>Actif</option>
                                <option>Inactif</option>
                            </select>
                            
                            <div className="pt-4 flex justify-end space-x-2">
                                <button type="button" onClick={handleCloseModal} disabled={isLoading} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50">Annuler</button>
                                <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">
                                    {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Delete Modal */}
            {isDeleteModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${baseClasses} rounded-lg shadow-xl w-full max-w-md p-6`}>
                        <h3 className="text-lg font-bold">Confirmer la suppression</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Voulez-vous vraiment supprimer **{memberToDelete?.name}**?</p>
                        <div className="mt-6 flex justify-end space-x-2">
                            <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={isLoading} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50">Annuler</button>
                            <button type="button" onClick={handleConfirmDelete} disabled={isLoading} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50">
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
