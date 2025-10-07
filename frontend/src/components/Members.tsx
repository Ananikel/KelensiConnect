// src/components/Members.tsx

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Member, Role } from '../types';

// CORRECTION TS2307: Imports d'icônes corrigés de './icons/' à '../icons/'
import SearchIcon from '../icons/SearchIcon';
import CameraIcon from '../icons/CameraIcon';
import CloseIcon from '../icons/CloseIcon';
import EditIcon from '../icons/EditIcon';
import DeleteIcon from '../icons/DeleteIcon';
import DownloadIcon from '../icons/DownloadIcon';
import Pagination from './Pagination'; // Reste ./Pagination car il est dans le même dossier
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
    const [roleFilter, setRoleFilter] = useState('Tous');
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form State (for modal)
    const [id, setId] = useState<number | undefined>(undefined);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [joinDate, setJoinDate] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [status, setStatus] = useState<'Actif' | 'Inactif'>('Actif');
    const [avatar, setAvatar] = useState('');
    const [roleId, setRoleId] = useState(roles[0]?.id || '');
    const [descendance, setDescendance] = useState('');
    const [contributionTypeIds, setContributionTypeIds] = useState<string[]>([]);
    
    // CORRECTION TS6133: Suppression des états non utilisés pour la caméra
    // const [isCameraOn, setIsCameraOn] = useState(false);
    // const videoRef = useRef<HTMLVideoElement>(null);
    // const canvasRef = useRef<HTMLCanvasElement>(null);
    // const streamRef = useRef<MediaStream | null>(null);

    // MAPPING & FILTERING
    const filteredMembers = useMemo(() => {
        let filtered = members;

        if (searchTerm) {
            filtered = filtered.filter(m => 
                m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'Tous') {
            filtered = filtered.filter(m => m.status === statusFilter);
        }

        if (roleFilter !== 'Tous') {
            filtered = filtered.filter(m => m.roleId === roleFilter);
        }

        return filtered.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
    }, [members, searchTerm, statusFilter, roleFilter]);

    const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);

    const paginatedMembers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredMembers, currentPage]);

    // RESET PAGINATION
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, roleFilter]);

    // HANDLERS
    const resetForm = () => {
        setId(undefined);
        setName('');
        setEmail('');
        setPhone('');
        setJoinDate(new Date().toISOString().split('T')[0]);
        setBirthDate('');
        setStatus('Actif');
        setAvatar('');
        setRoleId(roles[0]?.id || '');
        setDescendance('');
        setContributionTypeIds([]);
    };

    const handleOpenModal = (member?: Member) => {
        if (member) {
            setMemberToEdit(member);
            setId(member.id);
            setName(member.name);
            setEmail(member.email);
            setPhone(member.phone);
            setJoinDate(member.joinDate);
            setBirthDate(member.birthDate);
            setStatus(member.status);
            setAvatar(member.avatar);
            setRoleId(member.roleId);
            setDescendance(member.descendance);
            setContributionTypeIds(member.contributionTypeIds || []);
        } else {
            resetForm();
            setMemberToEdit(null);
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setIsLoading(false);
        setMemberToEdit(null);
        resetForm();
    };

    const handleOpenDeleteModal = (member: Member) => {
        setMemberToDelete(member);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!memberToDelete || !memberToDelete.id) return;
        setIsLoading(true);
        try {
            await onDeleteMember(memberToDelete.id);
            setDeleteModalOpen(false);
        } catch (error) {
            console.error("Erreur de suppression:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const memberData = {
            name, email, phone, joinDate, birthDate, status, avatar, roleId, descendance, contributionTypeIds
        };

        try {
            if (memberToEdit) {
                await onUpdateMember({ ...memberData, id: memberToEdit.id } as Member);
            } else {
                await onAddMember(memberData as Omit<Member, 'id'>);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Erreur de sauvegarde:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to get role name
    const getRoleName = (id: string) => roles.find(r => r.id === id)?.name || 'N/A';
    
    // Placeholder for handleDownloadCSV
    const handleDownloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Nom,Email,Téléphone,Statut,Rôle,Descendance,Date d'Adhésion\n";
        members.forEach(m => {
            csvContent += `${m.id},${m.name},${m.email},${m.phone},${m.status},${getRoleName(m.roleId)},${m.descendance},${m.joinDate}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "membres_kelensi.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    // Placeholder for handleCameraToggle (supprimé car non utilisé)
    
    // Placeholder for handleAvatarCapture (supprimé car non utilisé)

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md h-full flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Gestion des Membres</h2>

                {/* Controls and Filters */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Rechercher par nom ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            <option value="Tous">Tous les statuts</option>
                            <option value="Actif">Actif</option>
                            <option value="Inactif">Inactif</option>
                        </select>
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            <option value="Tous">Tous les rôles</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                        <button onClick={() => handleOpenModal()} className="p-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" title="Ajouter un membre">
                            <PlusIcon />
                        </button>
                        <button onClick={handleDownloadCSV} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Télécharger en CSV">
                            <DownloadIcon />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto relative shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Membre</th>
                                <th scope="col" className="px-6 py-3 hidden sm:table-cell">Email</th>
                                <th scope="col" className="px-6 py-3 hidden lg:table-cell">Téléphone</th>
                                <th scope="col" className="px-6 py-3 hidden sm:table-cell">Rôle</th>
                                <th scope="col" className="px-6 py-3">Statut</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMembers.map(m => (
                                <tr key={m.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white flex items-center">
                                        <img src={m.avatar || `https://placehold.co/40x40/${m.status === 'Actif' ? '4f46e5' : 'd1d5db'}/ffffff?text=${m.name.charAt(0)}`} alt={m.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                                        <div>
                                            <p>{m.name}</p>
                                            <p className="text-xs text-gray-500 sm:hidden">{m.email}</p>
                                        </div>
                                    </th>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        {m.email}
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        {m.phone}
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        {getRoleName(m.roleId)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            m.status === 'Actif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 space-x-2 flex items-center">
                                        <button onClick={() => handleOpenModal(m)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="Modifier">
                                            <EditIcon />
                                        </button>
                                        <button onClick={() => handleOpenDeleteModal(m)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Supprimer">
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Edit/Add Member Modal */}
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{memberToEdit ? 'Modifier le Membre' : 'Ajouter un Nouveau Membre'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <CloseIcon />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nom */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                                {/* Téléphone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                                    <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                                {/* Rôle */}
                                <div>
                                    <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
                                    <select id="roleId" value={roleId} onChange={e => setRoleId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Date d'Adhésion */}
                                <div>
                                    <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date d'Adhésion</label>
                                    <input type="date" id="joinDate" value={joinDate} onChange={e => setJoinDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                                {/* Date de Naissance */}
                                <div>
                                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de Naissance</label>
                                    <input type="date" id="birthDate" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                                {/* Statut */}
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                                    <select id="status" value={status} onChange={e => setStatus(e.target.value as any)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                        <option value="Actif">Actif</option>
                                        <option value="Inactif">Inactif</option>
                                    </select>
                                </div>
                                {/* Descendance */}
                                <div>
                                    <label htmlFor="descendance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descendance</label>
                                    <input type="text" id="descendance" value={descendance} onChange={e => setDescendance(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                                {/* Avatar URL */}
                                <div className="md:col-span-2">
                                    <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL Avatar (Optionnel)</label>
                                    <input type="url" id="avatar" value={avatar} onChange={e => setAvatar(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                                </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="pt-4 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700 mt-4">
                                <button type="button" onClick={handleCloseModal} disabled={isLoading} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50">Annuler</button>
                                <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
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
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Confirmer la suppression</h3>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">Voulez-vous vraiment supprimer **{memberToDelete?.name}**? Cette action est irréversible.</p>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={isLoading} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md disabled:opacity-50">Annuler</button>
                            <button type="button" onClick={handleConfirmDelete} disabled={isLoading} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
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
