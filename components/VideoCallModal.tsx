import React, { useState, useEffect, useRef } from 'react';
import { Member } from '../types';
import MicOnIcon from './icons/MicOnIcon';
import MicOffIcon from './icons/MicOffIcon';
import VideoOnIcon from './icons/VideoOnIcon';
import VideoOffIcon from './icons/VideoOffIcon';
import PhoneIcon from './icons/PhoneIcon';

interface VideoCallModalProps {
    isGroupCall: boolean;
    callType: 'audio' | 'video';
    targetMember?: Member;
    allMembers?: Member[];
    onClose: () => void;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ isGroupCall, callType, targetMember, allMembers, onClose }) => {
    const [isMicOn, setMicOn] = useState(true);
    const [isCameraOn, setCameraOn] = useState(callType === 'video');
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => {
        const startStream = async () => {
            try {
                const constraints = {
                    audio: true,
                    video: callType === 'video',
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                streamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                 if (callType === 'audio') {
                    setCameraOn(false);
                }
            } catch (err) {
                console.error("Erreur d'accès à la caméra/micro:", err);
                alert("Impossible d'accéder à la caméra ou au microphone. Veuillez vérifier les autorisations de votre navigateur.");
                onClose();
            }
        };

        startStream();

        return () => {
            stopStream();
        };
    }, [onClose, callType]);

    const toggleMic = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !isMicOn;
            });
            setMicOn(!isMicOn);
        }
    };
    
    const toggleCamera = () => {
        if (streamRef.current && callType === 'video') {
             streamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !isCameraOn;
            });
            setCameraOn(!isCameraOn);
        }
    };

    const handleHangUp = () => {
        stopStream();
        onClose();
    };

    const callTitle = isGroupCall ? "Appel de Groupe" : `${callType === 'video' ? 'Appel Vidéo' : 'Appel Audio'} avec ${targetMember?.name}`;

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 text-white">
            {/* Remote Video Area */}
            <div className="relative w-full h-full flex items-center justify-center">
                 <div className="absolute top-5 left-5 text-lg z-10">
                    <p className="font-semibold">{callTitle}</p>
                    <p className="text-sm text-gray-300">En cours...</p>
                </div>
                {isGroupCall ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 w-full h-full overflow-y-auto pt-20">
                         {allMembers?.slice(0, 12).map(member => ( // Show up to 12 members as placeholders
                             <div key={member.id} className="bg-gray-800 rounded-lg flex flex-col items-center justify-center aspect-w-1 aspect-h-1 p-2">
                                 <img src={member.avatar} alt={member.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover" />
                                 <p className="mt-2 text-sm text-center truncate w-full">{member.name}</p>
                             </div>
                         ))}
                     </div>
                ) : callType === 'audio' ? (
                     <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center">
                        <img src={targetMember?.avatar} alt={targetMember?.name} className="w-40 h-40 rounded-full object-cover ring-4 ring-gray-600"/>
                        <p className="mt-4 text-2xl font-semibold">{targetMember?.name}</p>
                        <p className="text-gray-400">Appel audio en cours...</p>
                    </div>
                ) : (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                         <div className="text-center text-gray-400">
                             <img src={targetMember?.avatar} alt={targetMember?.name} className="w-40 h-40 rounded-full object-cover opacity-50 mx-auto"/>
                             <p className="mt-4">Connexion avec {targetMember?.name}...</p>
                        </div>
                    </div>
                )}
            </div>

            {callType === 'video' && (
                <div className="absolute bottom-24 right-5 w-48 h-36 md:w-64 md:h-48 rounded-lg shadow-lg overflow-hidden border-2 border-gray-600 z-20">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                    {!isCameraOn && (
                         <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                            <p className="text-xs">Caméra coupée</p>
                         </div>
                    )}
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-gray-900/70 backdrop-blur-sm p-3 rounded-full z-20">
                <button 
                    onClick={toggleMic} 
                    className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-900 ${isMicOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}
                    aria-label={isMicOn ? "Couper le micro" : "Activer le micro"}
                >
                    {isMicOn ? <MicOnIcon /> : <MicOffIcon />}
                </button>
                {callType === 'video' && (
                    <button 
                        onClick={toggleCamera} 
                        className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-900 ${isCameraOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}
                        aria-label={isCameraOn ? "Couper la caméra" : "Activer la caméra"}
                    >
                        {isCameraOn ? <VideoOnIcon /> : <VideoOffIcon />}
                    </button>
                )}
                <button onClick={handleHangUp} className="p-3 bg-red-600 rounded-full hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-900" aria-label="Raccrocher">
                    <div className="rotate-[135deg]">
                        <PhoneIcon />
                    </div>
                </button>
            </div>
        </div>
    );
};

export default VideoCallModal;