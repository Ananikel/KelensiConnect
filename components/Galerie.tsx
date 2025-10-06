import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Photo } from '../types';
import SearchIcon from './icons/SearchIcon';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import DownloadIcon from './icons/DownloadIcon';
import UploadIcon from './icons/UploadIcon';
import CameraIcon from './icons/CameraIcon';
import CloseIcon from './icons/CloseIcon';
import Pagination from './Pagination';

interface GalerieProps {
    photos: Photo[];
    setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
}

const ITEMS_PER_PAGE = 8;

const Galerie: React.FC<GalerieProps> = ({ photos, setPhotos }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal States
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

    const importFileRef = useRef<HTMLInputElement>(null);

    const filteredPhotos = useMemo(() => {
        return photos.filter(photo => 
            photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            photo.description.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }, [photos, searchTerm]);

    const paginatedPhotos = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPhotos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPhotos, currentPage]);

    const totalPages = Math.ceil(filteredPhotos.length / ITEMS_PER_PAGE);

    const handleOpenAddModal = () => {
        setEditingPhoto(null);
        setAddEditModalOpen(true);
    };

    const handleOpenEditModal = (photo: Photo) => {
        setEditingPhoto(photo);
        setAddEditModalOpen(true);
    };

    const handleCloseAddEditModal = () => {
        setAddEditModalOpen(false);
        setEditingPhoto(null);
    };
    
    const handleSavePhoto = (photoData: Omit<Photo, 'id' | 'uploadDate'> & { id?: number }) => {
        if (photoData.id) { // Editing
            setPhotos(photos.map(p => p.id === photoData.id ? { ...p, ...photoData, url: photoData.url } as Photo : p));
        } else { // Adding
            const newPhoto: Photo = { 
                ...photoData,
                id: Date.now(), 
                uploadDate: new Date().toISOString()
            };
            setPhotos(prev => [newPhoto, ...prev]);
        }
        handleCloseAddEditModal();
    };

    const handleOpenDeleteModal = (photo: Photo) => {
        setPhotoToDelete(photo);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (photoToDelete) {
            setPhotos(photos.filter(p => p.id !== photoToDelete.id));
            setDeleteModalOpen(false);
            setPhotoToDelete(null);
            // If the deleted photo was the one being previewed, close preview
            if (isPreviewOpen && filteredPhotos[previewIndex]?.id === photoToDelete.id) {
                setPreviewOpen(false);
            }
        }
    };

    const handleOpenPreview = (photo: Photo) => {
        const index = filteredPhotos.findIndex(p => p.id === photo.id);
        if (index !== -1) {
            setPreviewIndex(index);
            setPreviewOpen(true);
        }
    };
    
    const handleNextPreview = useCallback(() => {
        setPreviewIndex(prev => (prev + 1) % filteredPhotos.length);
    }, [filteredPhotos.length]);

    const handlePrevPreview = useCallback(() => {
        setPreviewIndex(prev => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
    }, [filteredPhotos.length]);

    const handleExport = () => {
        const headers = ['ID', 'Titre', 'Description', "Date d'ajout", 'URL'];
        const csvRows = [
            headers.join(','),
            ...photos.map(p => [
                p.id,
                `"${p.title.replace(/"/g, '""')}"`,
                `"${p.description.replace(/"/g, '""')}"`,
                new Date(p.uploadDate).toLocaleString('fr-FR'),
                p.url.startsWith('data:') ? 'Image locale' : p.url
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'galerie_kelensiconnect.csv';
        link.click();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const filePromises = Array.from(files).map(file => {
            return new Promise<Photo>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newPhoto: Photo = {
                        id: Date.now() + Math.random(),
                        uploadDate: new Date().toISOString(),
                        url: e.target?.result as string,
                        title: file.name.split('.').slice(0, -1).join('.'),
                        description: `Importé le ${new Date().toLocaleDateString('fr-FR')}`
                    };
                    resolve(newPhoto);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(filePromises).then((newPhotos) => {
            setPhotos(prev => [...newPhotos, ...prev]);
        });
        
        // Reset file input
        if (event.target) {
            event.target.value = '';
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Rechercher une photo..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <input type="file" multiple accept="image/*" ref={importFileRef} onChange={handleImport} className="hidden" />
                        <button onClick={() => importFileRef.current?.click()} className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                           <UploadIcon />
                           <span className="ml-2 hidden md:inline">Importer</span>
                        </button>
                        <button onClick={handleExport} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                           <DownloadIcon />
                           <span className="ml-2 hidden md:inline">Exporter</span>
                        </button>
                         <button onClick={handleOpenAddModal} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <PlusIcon />
                            <span className="ml-2">Ajouter</span>
                        </button>
                    </div>
                </div>

                {filteredPhotos.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {paginatedPhotos.map(photo => (
                                <div key={photo.id} className="group relative rounded-lg overflow-hidden shadow-lg" >
                                    <button type="button" className="w-full h-full block text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg" onClick={() => handleOpenPreview(photo)}>
                                        <img src={photo.url} alt={photo.title} className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300"></div>
                                        <div className="absolute bottom-0 left-0 p-3 w-full bg-gradient-to-t from-black via-black/70 to-transparent">
                                            <h3 className="text-white font-bold truncate">{photo.title}</h3>
                                            <p className="text-gray-300 text-xs">{new Date(photo.uploadDate).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    </button>
                                    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => handleOpenEditModal(photo)} className="bg-white/80 p-1.5 rounded-full text-gray-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Modifier"><EditIcon /></button>
                                        <button onClick={() => handleOpenDeleteModal(photo)} className="bg-white/80 p-1.5 rounded-full text-gray-800 hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-500" aria-label="Supprimer"><DeleteIcon /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                ) : (
                     <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        Aucune photo trouvée.
                    </div>
                )}
            </div>
            
            {isAddEditModalOpen && <AddEditPhotoModal photo={editingPhoto} onSave={handleSavePhoto} onClose={handleCloseAddEditModal} />}
            {isDeleteModalOpen && photoToDelete && <DeleteConfirmationModal photo={photoToDelete} onConfirm={handleConfirmDelete} onClose={() => setDeleteModalOpen(false)} />}
            {isPreviewOpen && <PhotoPreviewModal photos={filteredPhotos} startIndex={previewIndex} onClose={() => setPreviewOpen(false)} onNext={handleNextPreview} onPrev={handlePrevPreview} />}
        </>
    );
};

// Add/Edit Modal Component - REFACTORED
const AddEditPhotoModal: React.FC<{ photo: Photo | null; onSave: (data: Omit<Photo, 'id' | 'uploadDate'> & { id?: number }) => void; onClose: () => void; }> = ({ photo, onSave, onClose }) => {
    const [title, setTitle] = useState(photo?.title || '');
    const [description, setDescription] = useState(photo?.description || '');
    const [url, setUrl] = useState(photo?.url || '');
    const [isCameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);
    
    useEffect(() => {
        // Cleanup camera on component unmount
        return () => stopCamera();
    }, [stopCamera]);

    const handleStartCamera = async () => {
        setCameraError(null);
        setUrl('');
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("La fonctionnalité caméra n'est pas supportée par ce navigateur.");
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            setCameraActive(true);
        } catch (err) {
            console.error("Erreur d'accès à la caméra:", err);
            setCameraError("Impossible d'accéder à la caméra. Veuillez vérifier les autorisations dans les paramètres de votre navigateur.");
            setCameraActive(false);
        }
    };

    const handleCancelCamera = () => {
        stopCamera();
        setCameraActive(false);
        setCameraError(null);
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            const video = videoRef.current;
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            setUrl(canvasRef.current.toDataURL('image/jpeg', 0.9));
            stopCamera();
            setCameraActive(false);
        }
    };
    
    const triggerFileUpload = () => {
        if (isCameraActive) {
            handleCancelCamera();
        }
        fileInputRef.current?.click();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setUrl(loadEvent.target?.result as string);
                if (!title) setTitle(file.name.split('.').slice(0, -1).join('.'));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || !title) return;
        onSave({ id: photo?.id, title, description, url });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                 <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">{photo ? 'Modifier la photo' : 'Ajouter une photo'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" aria-label="Fermer"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image</label>
                        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-900 rounded-md flex items-center justify-center p-1 border-2 border-dashed border-gray-300 dark:border-gray-600 relative overflow-hidden">
                           {isCameraActive && !cameraError && (
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-md"></video>
                           )}
                           {!isCameraActive && url && (
                                <img src={url} alt="Aperçu" className="max-w-full max-h-full object-contain rounded-md" />
                           )}
                           {cameraError && (
                                <div className="text-center text-red-500 p-4">
                                    <p>{cameraError}</p>
                                </div>
                           )}
                           {!isCameraActive && !url && !cameraError && (
                                <div className="text-center text-gray-500 dark:text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="mt-2 text-sm">L'aperçu de l'image apparaîtra ici</p>
                                </div>
                           )}
                           <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>
                    </div>
                    
                     <div className="flex items-center justify-center flex-wrap gap-4 pt-1">
                        {!isCameraActive ? (
                            <>
                                <button type="button" onClick={triggerFileUpload} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:underline">
                                    Télécharger un fichier
                                </button>
                                <input id="file-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" ref={fileInputRef} />
                                <span className="text-gray-400 dark:text-gray-500">ou</span>
                                 <button type="button" onClick={handleStartCamera} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:underline">
                                    Prendre une photo
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center justify-center space-x-4">
                                <button type="button" onClick={handleCapture} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
                                    <div className="w-5 h-5 text-white"><CameraIcon/></div>
                                    <span>Capturer la photo</span>
                                </button>
                                <button type="button" onClick={handleCancelCamera} className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
                                    Annuler
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} disabled={!url} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} disabled={!url} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed" />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">Annuler</button>
                        <button type="submit" disabled={!url || !title} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    )
};

// Delete Modal
const DeleteConfirmationModal: React.FC<{photo: Photo; onConfirm: () => void; onClose: () => void}> = ({ photo, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Confirmer la suppression</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Êtes-vous sûr de vouloir supprimer la photo <strong>"{photo.title}"</strong> ? Cette action est irréversible.
                </p>
                </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500">Annuler</button>
                <button type="button" onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Supprimer</button>
            </div>
        </div>
    </div>
);

// Preview Modal (Lightbox)
const PhotoPreviewModal: React.FC<{ photos: Photo[]; startIndex: number; onClose: () => void; onNext: () => void; onPrev: () => void; }> = ({ photos, startIndex, onClose, onNext, onPrev }) => {
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') onNext();
        if (e.key === 'ArrowLeft') onPrev();
        if (e.key === 'Escape') onClose();
    }, [onNext, onPrev, onClose]);
    
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    
    const photo = photos[startIndex];
    if (!photo) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-[60] p-4" onClick={onClose}>
            <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }} 
                className="absolute top-4 right-4 z-20 text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50" 
                aria-label="Fermer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                {photos.length > 1 && (
                     <>
                        <button onClick={onPrev} className="absolute left-4 z-10 text-white bg-black/30 p-3 rounded-full hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white" aria-label="Précédent">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={onNext} className="absolute right-4 z-10 text-white bg-black/30 p-3 rounded-full hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white" aria-label="Suivant">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                     </>
                )}
                <div className="max-w-[85vw] max-h-[85vh] flex flex-col items-center animate-zoom-in">
                    <img src={photo.url} alt={photo.title} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                     <div className="text-center mt-3 text-white bg-black/50 p-2 rounded-md max-w-full">
                        <h3 className="font-bold text-lg">{photo.title}</h3>
                        {photo.description && <p className="text-sm text-gray-300 break-words">{photo.description}</p>}
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes zoom-in {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-zoom-in {
                    animation: zoom-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Galerie;