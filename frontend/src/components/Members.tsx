// src/components/Members.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { Member, Role } from '../types';

// Corrected relative paths for icons: '../icons/...'
import SearchIcon from '../icons/SearchIcon';
import CameraIcon from '../icons/CameraIcon';
import CloseIcon from '../icons/CloseIcon';
import EditIcon from '../icons/EditIcon';
import DeleteIcon from '../icons/DeleteIcon';
import DownloadIcon from '../icons/DownloadIcon';
import Pagination from './Pagination'; 
import EmailIcon from '../icons/EmailIcon';
import PhoneIcon from '../icons/PhoneIcon';
import UserIcon from '../icons/UserIcon';
import CalendarIcon from '../icons/CalendarIcon';
import DescendanceIcon from '../icons/DescendanceIcon';

interface MembersProps {
    members: Member[];
    roles: Role[];
    onAddMember: (memberData: Omit<Member, 'id' | 'joinDate' | 'avatar'> & { avatar?: string }) => Promise<void>;
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
    // Note: Avatar logic removed as per corrupted file's internal comments (TS6133 fix)

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
        setName('');
        setEmail(''); 
        setPhone(''); 
        setDescendance(''); 
        setBirthDate('');
        setRoleId(roles.find(r => r.id === 'member')?.id || roles[0]?.id || '');
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

    const handleOpenDeleteModal = (member: Member) => {
        setMemberToDelete(member);
        setDeleteModalOpen(true);
    };

    const handleCloseModal = () => {
        setAddEditModalOpen(false);
        setEditingMember(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const memberData = {
            name, email, phone, descendance, birthDate, roleId, status,
        };

        if (!name || !email || !roleId || !birthDate || !phone) {
             alert("Veuillez remplir tous les champs obligatoires.");
             setIsLoading(false);
             return;
        }

        try {
            if (editingMember) {
                // Update member
                await onUpdateMember({
                    ...editingMember,
                    ...memberData,
                    avatar: editingMember.avatar, 
                });
            } else {
                // Add new member
                await onAddMember({
                    ...memberData,
                    avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`,
                    joinDate: new Date().toISOString(),
                    status: 'Actif', // Enforce 'Actif' for new members
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

    const handleExportMembers = () => {
        const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Descendance', 'Date de Naissance', 'Date d\'Adhésion', 'Rôle', 'Statut'];
        const csvRows = [
            headers.join(','),
            ...members.map(m => [
                m.id,
                `"${m.name.replace(/"/g, '""')}"`,
                m.email,
                m.phone,
                `"${m.descendance.replace(/"/g, '""')}"`,
                new Date(m.birthDate).toLocaleDateString('fr-FR'),
                new Date(m.joinDate).toLocaleDateString('fr-FR'),
                roles.find(r => r.id === m.roleId)?.name || m.roleId,
                m.status
            ].join(','))
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); 

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'membres_kelensiconnect.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        // Reset current page when filters change
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Rechercher un membre (nom, email)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4 w-full md:w-auto justify-end">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        >
                            <option>Tous</option>
                            <option>Actif</option>
                            <option>Inactif</option>
                        </select>
                        <button 
                            onClick={handleExportMembers} 
                            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Exporter en CSV"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleOpenAddModal} 
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Ajouter Membre</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Member Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedMembers.map(member => (
                    <div key={member.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                        <img 
                            src={member.avatar || `https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&background=random`}
                            alt={`Avatar de ${member.name}`}
                            className="w-20 h-20 rounded-full object-cover mb-4 ring-2 ring-indigo-500 dark:ring-indigo-400"
                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&background=random` }}
                        />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate w-full">{member.name}</h3>
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-3">{roles.find(r => r.id === member.roleId)?.name || member.roleId}</p>
                        
                        <div className="text-left w-full space-y-1 text-gray-600 dark:text-gray-400 text-sm">
                            <p className="flex items-center space-x-2"><EmailIcon className="w-4 h-4 text-indigo-500"/> <span className="truncate">{member.email}</span></p>
                            <p className="flex items-center space-x-2"><PhoneIcon className="w-4 h-4 text-indigo-500"/> {member.phone}</p>
                            <p className="flex items-center space-x-2"><DescendanceIcon className="w-4 h-4 text-indigo-500"/> {member.descendance}</p>
                            <p className="flex items-center space-x-2"><CalendarIcon className="w-4 h-4 text-indigo-500"/> Né(e) le: {new Date(member.birthDate).toLocaleDateString('fr-FR')}</p>
                        </div>

                        <span className={`mt-3 px-3 py-1 text-xs font-medium rounded-full ${
                            member.status === 'Actif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                            {member.status}
                        </span>

                        <div className="mt-4 flex space-x-3">
                            <button 
                                onClick={() => handleOpenEditModal(member)}
                                className="p-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                                aria-label="Modifier"
                            >
                                <EditIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => handleOpenDeleteModal(member)}
                                className="p-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                aria-label="Supprimer"
                            >
                                <DeleteIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="mt-6">
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Add/Edit Modal */}
            {isAddEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {editingMember ? 'Modifier le Membre' : 'Ajouter un Nouveau Membre'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom Complet <span className="text-red-500">*</span></label>
                                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required 
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email <span className="text-red-500">*</span></label>
                                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required 
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone <span className="text-red-500">*</span></label>
                                    <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required 
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                                <div>
                                    <label htmlFor="descendance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lien de Descendance</label>
                                    <input type="text" id="descendance" value={descendance} onChange={e => setDescendance(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                                <div>
                                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de Naissance <span className="text-red-500">*</span></label>
                                    <input type="date" id="birthDate" value={birthDate} onChange={e => setBirthDate(e.target.value)} required 
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                                <div>
                                    <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle <span className="text-red-500">*</span></label>
                                    <select id="roleId" value={roleId} onChange={e => setRoleId(e.target.value)} required 
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                        <option value="">Sélectionner un rôle</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {editingMember && (
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut <span className="text-red-500">*</span></label>
                                        <select id="status" value={status} onChange={e => setStatus(e.target.value as 'Actif' | 'Inactif')} required 
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                            <option>Actif</option>
                                            <option>Inactif</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="pt-6 flex justify-end space-x-2">
                                <button type="button" onClick={handleCloseModal} disabled={isLoading} 
                                    className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" disabled={isLoading} 
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-colors">
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Confirmer la suppression</h3>
                            <button onClick={() => setDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                            Voulez-vous vraiment supprimer le membre **{memberToDelete?.name}**? Cette action est irréversible.
                        </p>
                        <div className="mt-6 flex justify-end space-x-2">
                            <button 
                                type="button" 
                                onClick={() => setDeleteModalOpen(false)} 
                                disabled={isLoading}
                                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                type="button" 
                                onClick={handleConfirmDelete} 
                                disabled={isLoading} 
                                className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
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
