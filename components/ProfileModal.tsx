import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UserProfile } from '../types';
import CloseIcon from './icons/CloseIcon';
import CameraIcon from './icons/CameraIcon';
import UploadIcon from './icons/UploadIcon';

interface ProfileModalProps {
    user: UserProfile;
    onSave: (updatedProfile: UserProfile) => void;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onSave, onClose }) => {
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar);
    const [isCameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
    }, []);

    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    const handleStartCamera = async () => {
        setCameraError(null);
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("La fonctionnalité caméra n'est pas supportée par ce navigateur.");
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraActive(true);
        } catch (err) {
            console.error("Erreur d'accès à la caméra:", err);
            setCameraError("Impossible d'accéder à la caméra. Veuillez vérifier les autorisations.");
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            const video = videoRef.current;
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            setAvatar(canvasRef.current.toDataURL('image/jpeg', 0.9));
            stopCamera();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setAvatar(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, avatar });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Modifier mon profil</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800" aria-label="Fermer">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                            {isCameraActive ? (
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            ) : (
                                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        
                        {cameraError && <p className="text-sm text-red-500 text-center">{cameraError}</p>}
                        
                        <div className="flex items-center space-x-4">
                            {isCameraActive ? (
                                <>
                                    <button type="button" onClick={handleCapture} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Capturer
                                    </button>
                                    <button type="button" onClick={stopCamera} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                                        Annuler
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <UploadIcon />
                                        <span>Télécharger</span>
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                                    <button type="button" onClick={handleStartCamera} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <div className="w-5 h-5"><CameraIcon /></div>
                                        <span>Prendre photo</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            required
                        />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Annuler</button>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
