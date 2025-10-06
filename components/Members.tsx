import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Member, Role } from '../types';
import SearchIcon from './icons/SearchIcon';
import CameraIcon from './icons/CameraIcon';
import CloseIcon from './icons/CloseIcon';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import DownloadIcon from './icons/DownloadIcon';
import Pagination from './Pagination';
import EmailIcon from './icons/EmailIcon';
import PhoneIcon from './icons/PhoneIcon';

interface MembersProps {
    members: Member[];
    setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
    roles: Role[];
}

const ITEMS_PER_PAGE = 8;

const Members: React.FC<MembersProps> = ({ members, setMembers, roles }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Edit and Delete state
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

    // Form state for adding
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [descendance, setDescendance] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [roleId, setRoleId] = useState(roles.find(r => r.id === 'member')?.id || '');

    // Webcam state
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  member.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'Tous' || member.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [members, searchTerm, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const paginatedMembers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredMembers, currentPage]);

    const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
    
    const descendances = useMemo(() => [...new Set(members.map(m => m.descendance))], [members]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOn(false);
    }, []);

    const startCamera = useCallback(async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsCameraOn(true);
            } catch (err) {
                console.error("Erreur d'accès à la caméra:", err);
                alert("Impossible d'accéder à la caméra. Veuillez vérifier les autorisations de votre navigateur.");
                setIsCameraOn(false);
            }
        }
    }, []);

    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                const video = videoRef.current;
                canvasRef.current.width = video.videoWidth;
                canvasRef.current.height = video.videoHeight;
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const newImage = canvasRef.current.toDataURL('image/png');
                setCapturedImage(newImage);
                if(editingMember) {
                    setEditingMember(prev => prev ? {...prev, avatar: newImage} : null);
                }
                stopCamera();
            }
        }
    };
    
    const handleRetake = () => {
        setCapturedImage(null);
        if(editingMember) {
             setEditingMember(prev => prev ? {...prev, avatar: ''} : null);
        }
        startCamera();
    };

    const handleOpenAddModal = () => setAddModalOpen(true);

    const handleCloseAddModal = () => {
        setAddModalOpen(false);
        stopCamera();
        setName('');
        setEmail('');
        setPhone('');
        setDescendance('');
        setBirthDate('');
        setRoleId(roles.find(r => r.id === 'member')?.id || '');
        setCapturedImage(null);
    };
    
    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !email || !descendance || !birthDate || !roleId) return;

        const newMember: Member = {
            id: Date.now(),
            name,
            email,
            descendance,
            birthDate,
            avatar: capturedImage || `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`,
            joinDate: new Date().toISOString(),
            status: 'Actif',
            phone,
            roleId,
        };
        setMembers(prev => [newMember, ...prev]);
        handleCloseAddModal();
    };
    
    const handleOpenEditModal = (member: Member) => {
        setEditingMember({ ...member });
        setCapturedImage(member.avatar.startsWith('data:image') ? member.avatar : null);
    };

    const handleCloseEditModal = () => {
        setEditingMember(null);
        stopCamera();
        setCapturedImage(null);
    };

    const handleUpdateMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember) return;
        setMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m));
        handleCloseEditModal();
    };

    const handleOpenDeleteModal = (member: Member) => {
        setMemberToDelete(member);
        setDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setMemberToDelete(null);
        setDeleteModalOpen(false);
    };
    
    const handleConfirmDelete = () => {
        if (!memberToDelete) return;
        setMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
        handleCloseDeleteModal();
    };

    const handleAvatarClick = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
        setAvatarModalOpen(true);
    };

    const handleExportMembers = () => {
        const rolesMap = new Map(roles.map(r => [r.id, r.name]));
        const headers = ['ID', 'Nom', 'Email', 'Téléphone', "Date d'adhésion", 'Statut', 'Rôle', 'Descendance'];
        const csvRows = [
            headers.join(','),
            ...members.map(m => [
                m.id,
                `"${m.name.replace(/"/g, '""')}"`, // Escape quotes and wrap in quotes
                m.email,
                m.phone,
                new Date(m.joinDate).toLocaleDateString('fr-FR'),
                m.status,
                rolesMap.get(m.roleId) || 'N/A',
                `"${m.descendance.replace(/"/g, '""')}"`
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'membres_kelensiconnect.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Rechercher un membre..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        >
                            <option>Tous</option>
                            <option>Actif</option>
                            <option>Inactif</option>
                        </select>
                        <button onClick={handleExportMembers} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            <DownloadIcon />
                            <span className="ml-2 hidden md:inline">Exporter</span>
                        </button>
                         <button onClick={handleOpenAddModal} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Ajouter Membre
                        </button>
                    </div>
                </div>
            </div>

             {paginatedMembers.length > 0 ? (
                <>
                    <div className="pt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-20">
                        {paginatedMembers.map((member) => {
                             const role = roles.find(r => r.id === member.roleId);
                             return (
                                <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg pt-14 p-6 relative text-center transform hover:-translate-y-2 transition-transform duration-300">
                                    <button type="button" onClick={() => handleAvatarClick(member.avatar)} className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none rounded-full focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900">
                                        <img
                                            className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
                                            src={member.avatar}
                                            alt={member.name}
                                        />
                                        <span className={`absolute bottom-2 right-2 h-4 w-4 rounded-full ${member.status === 'Actif' ? 'bg-green-500' : 'bg-red-500'} ring-2 ring-white dark:ring-gray-800`} title={member.status}></span>
                                    </button>
                                    
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 truncate">{member.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.descendance}</p>
                                    {role && <span className="mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">{role.name}</span>}
                                
                                    <hr className="my-4 border-t border-gray-200 dark:border-gray-700" />
                                    
                                    <div className="space-y-2 text-left text-sm text-gray-700 dark:text-gray-300">
                                        <p className="flex items-center" title={member.email}>
                                            <EmailIcon /> <span className="ml-3 truncate">{member.email}</span>
                                        </p>
                                        <p className="flex items-center">
                                            <PhoneIcon /> <span className="ml-3">{member.phone || 'N/A'}</span>
                                        </p>
                                    </div>
                                
                                    <div className="mt-6 flex justify-center space-x-2">
                                        <button onClick={() => handleOpenEditModal(member)} className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            <EditIcon />
                                            <span className="ml-2">Modifier</span>
                                        </button>
                                        <button onClick={() => handleOpenDeleteModal(member)} className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                            <DeleteIcon />
                                            <span className="ml-2">Supprimer</span>
                                        </button>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                     <div className="mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </>
            ) : (
                 <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p>Aucun membre trouvé.</p>
                </div>
            )}
            
            {/* Add Member Modal */}
            {isAddModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Ajouter un nouveau membre</h3>
                            <button onClick={handleCloseAddModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800" aria-label="Fermer">
                               <CloseIcon />
                            </button>
                        </div>
                        <form onSubmit={handleAddMember} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
                                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                                <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                            </div>
                            <div>
                                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
                                <select id="roleId" value={roleId} onChange={e => setRoleId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="descendance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descendance</label>
                                <input list="descendances-list" id="descendance" value={descendance} onChange={e => setDescendance(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                                <datalist id="descendances-list">
                                    {descendances.map(d => <option key={d} value={d} />)}
                                </datalist>
                            </div>
                            <div>
                                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de naissance</label>
                                <input type="date" id="birthDate" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo de profil</label>
                                <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                                    {capturedImage ? (
                                        <div className="text-center">
                                            <img src={capturedImage} alt="Captured" className="w-32 h-32 rounded-full object-cover mx-auto" />
                                            <button type="button" onClick={handleRetake} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md">Reprendre la photo</button>
                                        </div>
                                    ) : isCameraOn ? (
                                        <div className="text-center">
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md mb-2"></video>
                                            <button type="button" onClick={handleCapture} className="px-4 py-2 bg-indigo-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Capturer</button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={startCamera} className="flex flex-col items-center space-y-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            <CameraIcon />
                                            <span>Prendre une photo</span>
                                        </button>
                                    )}
                                    <canvas ref={canvasRef} className="hidden"></canvas>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button type="button" onClick={handleCloseAddModal} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Annuler</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Member Modal */}
            {editingMember && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Modifier le membre</h3>
                            <button onClick={handleCloseEditModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800" aria-label="Fermer">
                               <CloseIcon />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateMember} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
                                <input type="text" id="edit-name" value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                            </div>
                             <div>
                                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input type="email" id="edit-email" value={editingMember.email} onChange={e => setEditingMember({...editingMember, email: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                            </div>
                            <div>
                                <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                                <input type="tel" id="edit-phone" value={editingMember.phone} onChange={e => setEditingMember({...editingMember, phone: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                            </div>
                            <div>
                                <label htmlFor="edit-roleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
                                <select id="edit-roleId" value={editingMember.roleId} onChange={e => setEditingMember({...editingMember, roleId: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="edit-descendance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descendance</label>
                                <input list="descendances-list" id="edit-descendance" value={editingMember.descendance} onChange={e => setEditingMember({...editingMember, descendance: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                                <datalist id="descendances-list">
                                    {descendances.map(d => <option key={d} value={d} />)}
                                </datalist>
                            </div>
                            <div>
                                <label htmlFor="edit-birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de naissance</label>
                                <input type="date" id="edit-birthDate" value={editingMember.birthDate.split('T')[0]} onChange={e => setEditingMember({...editingMember, birthDate: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                            </div>
                            <div>
                                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                                <select id="edit-status" value={editingMember.status} onChange={e => setEditingMember({...editingMember, status: e.target.value as 'Actif' | 'Inactif'})} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                                    <option>Actif</option>
                                    <option>Inactif</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo de profil</label>
                                <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                                    { (capturedImage || editingMember.avatar) && !isCameraOn ? (
                                        <div className="text-center">
                                            <img src={capturedImage || editingMember.avatar} alt="Avatar" className="w-32 h-32 rounded-full object-cover mx-auto" />
                                            <button type="button" onClick={handleRetake} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md">Changer la photo</button>
                                        </div>
                                    ) : isCameraOn ? (
                                        <div className="text-center">
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md mb-2"></video>
                                            <button type="button" onClick={handleCapture} className="px-4 py-2 bg-indigo-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Capturer</button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={startCamera} className="flex flex-col items-center space-y-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            <CameraIcon />
                                            <span>Prendre une photo</span>
                                        </button>
                                    )}
                                    <canvas ref={canvasRef} className="hidden"></canvas>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button type="button" onClick={handleCloseEditModal} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Annuler</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && memberToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                         <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Confirmer la suppression</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Êtes-vous sûr de vouloir supprimer <strong>{memberToDelete.name}</strong> ? Cette action est irréversible.
                            </p>
                         </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                            <button type="button" onClick={handleCloseDeleteModal} className="bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Annuler</button>
                            <button type="button" onClick={handleConfirmDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* View Avatar Modal */}
            {isAvatarModalOpen && selectedAvatar && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setAvatarModalOpen(false)}>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedAvatar} alt="Avatar" className="max-w-[80vw] max-h-[80vh] rounded-lg shadow-xl" />
                        <button onClick={() => setAvatarModalOpen(false)} className="absolute -top-4 -right-4 bg-white rounded-full p-1 text-gray-700 hover:text-black focus:outline-none focus:ring-2 focus:ring-white" aria-label="Fermer">
                            <CloseIcon />
                        </button>
                    </div>
                 </div>
            )}
        </>
    );
};

export default Members;