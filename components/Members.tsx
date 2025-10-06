
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Member } from '../types';
import SearchIcon from './icons/SearchIcon';
import CameraIcon from './icons/CameraIcon';
import CloseIcon from './icons/CloseIcon';

interface MembersProps {
    members: Member[];
    setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

const Members: React.FC<MembersProps> = ({ members, setMembers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [descendance, setDescendance] = useState('');

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
    
    const descendances = useMemo(() => [...new Set(members.map(m => m.descendance))], [members]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
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
                setCapturedImage(canvasRef.current.toDataURL('image/png'));
                stopCamera();
                setIsCameraOn(false);
            }
        }
    };
    
    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const handleOpenAddModal = () => {
        setAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setAddModalOpen(false);
        stopCamera();
        setIsCameraOn(false);
        // Reset form
        setName('');
        setEmail('');
        setDescendance('');
        setCapturedImage(null);
    };
    
    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !email || !descendance) return;

        const newMember: Member = {
            id: Date.now(),
            name,
            email,
            descendance,
            avatar: capturedImage || `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`,
            joinDate: new Date().toISOString(),
            status: 'Actif',
            phone: '',
            role: 'Membre',
        };
        setMembers(prev => [newMember, ...prev]);
        handleCloseAddModal();
    };
    
    const handleAvatarClick = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
        setAvatarModalOpen(true);
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Rechercher un membre..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option>Tous</option>
                            <option>Actif</option>
                            <option>Inactif</option>
                        </select>
                         <button onClick={handleOpenAddModal} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow">
                            Ajouter Membre
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descendance</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'adhésion</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMembers.map((member: Member) => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img 
                                                    className="h-10 w-10 rounded-full object-cover cursor-pointer" 
                                                    src={member.avatar} 
                                                    alt={member.name} 
                                                    onClick={() => handleAvatarClick(member.avatar)}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.descendance}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(member.joinDate).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            member.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {member.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredMembers.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Aucun membre trouvé.
                    </div>
                )}
            </div>
            
            {/* Add Member Modal */}
            {isAddModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Ajouter un nouveau membre</h3>
                            <button onClick={handleCloseAddModal} className="text-gray-400 hover:text-gray-600">
                               <CloseIcon />
                            </button>
                        </div>
                        <form onSubmit={handleAddMember} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
                                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                            </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                            </div>
                            <div>
                                <label htmlFor="descendance" className="block text-sm font-medium text-gray-700">Descendance</label>
                                <input list="descendances-list" id="descendance" value={descendance} onChange={e => setDescendance(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                                <datalist id="descendances-list">
                                    {descendances.map(d => <option key={d} value={d} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Photo de profil</label>
                                <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-md">
                                    {capturedImage ? (
                                        <div className="text-center">
                                            <img src={capturedImage} alt="Captured" className="w-32 h-32 rounded-full object-cover mx-auto" />
                                            <button type="button" onClick={handleRetake} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">Reprendre la photo</button>
                                        </div>
                                    ) : isCameraOn ? (
                                        <div className="text-center">
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-md mb-2"></video>
                                            <button type="button" onClick={handleCapture} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Capturer</button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={startCamera} className="flex flex-col items-center space-y-2 text-gray-500 hover:text-indigo-600">
                                            <CameraIcon />
                                            <span>Prendre une photo</span>
                                        </button>
                                    )}
                                    <canvas ref={canvasRef} className="hidden"></canvas>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button type="button" onClick={handleCloseAddModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2">Annuler</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md">Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* View Avatar Modal */}
            {isAvatarModalOpen && selectedAvatar && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setAvatarModalOpen(false)}>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedAvatar} alt="Avatar" className="max-w-[80vw] max-h-[80vh] rounded-lg shadow-xl" />
                        <button onClick={() => setAvatarModalOpen(false)} className="absolute -top-4 -right-4 bg-white rounded-full p-1 text-gray-700 hover:text-black">
                            <CloseIcon />
                        </button>
                    </div>
                 </div>
            )}
        </>
    );
};

export default Members;