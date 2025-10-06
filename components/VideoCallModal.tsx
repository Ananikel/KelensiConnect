import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    const [currentCallMode, setCurrentCallMode] = useState<'audio' | 'video'>(callType);
    const [isMicOn, setMicOn] = useState(true);
    const [isCameraOn, setCameraOn] = useState(callType === 'video');
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);
    
    // Ringtone effect
    useEffect(() => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const audioContext = new AudioContext();
        let ringInterval: ReturnType<typeof setInterval> | null = null;
        let isRinging = true;

        const playRingSequence = () => {
            if (!isRinging || audioContext.state === 'closed') return;
            const now = audioContext.currentTime;
            const ringDuration = 1.5;
            const createTone = (freq: number) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
                gain.gain.setValueAtTime(0.2, now + ringDuration - 0.05);
                gain.gain.linearRampToValueAtTime(0, now + ringDuration);
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.start(now);
                osc.stop(now + ringDuration);
            }
            createTone(440);
            createTone(480);
        };
        
        playRingSequence();
        ringInterval = setInterval(playRingSequence, 4000);

        return () => {
            isRinging = false;
            if (ringInterval) clearInterval(ringInterval);
            if (audioContext.state !== 'closed') audioContext.close().catch(console.error);
        };
    }, []);

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
            } catch (err) {
                console.error("Erreur d'accès à la caméra/micro:", err);
                alert("Impossible d'accéder à la caméra ou au microphone. Veuillez vérifier les autorisations.");
                onClose();
            }
        };

        startStream();

        return () => {
            stopStream();
        };
    }, [onClose, callType, stopStream]);

    const toggleMic = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !isMicOn;
            });
            setMicOn(!isMicOn);
        }
    };
    
    const toggleCamera = async () => {
        const videoTracks = streamRef.current?.getVideoTracks() ?? [];

        if (isCameraOn) { // Turning camera OFF
            videoTracks.forEach(track => track.enabled = false);
            setCameraOn(false);
        } else { // Turning camera ON
            if (videoTracks.length > 0) { // Camera track exists, just enable it
                videoTracks.forEach(track => track.enabled = true);
                setCameraOn(true);
            } else { // No camera track, need to get it (audio -> video)
                try {
                    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const videoTrack = videoStream.getVideoTracks()[0];
                    
                    streamRef.current?.addTrack(videoTrack);

                    if (localVideoRef.current && streamRef.current) {
                        localVideoRef.current.srcObject = streamRef.current;
                    }
                    
                    setCameraOn(true);
                    setCurrentCallMode('video');
                } catch (err) {
                    console.error("Erreur d'accès à la caméra:", err);
                    alert("Impossible d'activer la caméra. Veuillez vérifier les autorisations.");
                }
            }
        }
    };

    const handleHangUp = () => {
        stopStream();
        onClose();
    };

    const callTitle = isGroupCall ? `Appel de Groupe ${currentCallMode === 'video' ? 'Vidéo' : 'Audio'}` : `${currentCallMode === 'video' ? 'Appel Vidéo' : 'Appel Audio'} avec ${targetMember?.name}`;

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 text-white">
            <div className="relative w-full h-full flex items-center justify-center">
                 <div className="absolute top-5 left-5 text-lg z-10">
                    <p className="font-semibold">{callTitle}</p>
                    <p className="text-sm text-gray-300">En cours...</p>
                </div>
                {isGroupCall ? (
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 w-full h-full overflow-y-auto pt-20">
                         <div className="bg-black rounded-lg flex items-center justify-center aspect-w-1 aspect-h-1 relative overflow-hidden">
                            {isCameraOn && (
                                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                            )}
                            {!isCameraOn && (
                                 <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                                    <img src={`https://ui-avatars.com/api/?name=Vous&background=6366f1&color=fff`} alt="Vous" className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover" />
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-1 bg-black bg-opacity-50">
                                <p className="text-xs text-center text-white truncate">Vous</p>
                            </div>
                         </div>
                         {allMembers?.slice(0, 11).map(member => (
                             <div key={member.id} className="bg-gray-800 rounded-lg flex flex-col items-center justify-center aspect-w-1 aspect-h-1 p-2 relative overflow-hidden">
                                 <img src={member.avatar} alt={member.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover" />
                                 <div className="absolute bottom-0 left-0 right-0 p-1 bg-black bg-opacity-50">
                                    <p className="text-xs text-center text-white truncate">{member.name}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                ) : currentCallMode === 'audio' ? (
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

            {currentCallMode === 'video' && !isGroupCall && (
                <div className="absolute bottom-24 right-5 w-48 h-36 md:w-64 md:h-48 rounded-lg shadow-lg overflow-hidden border-2 border-gray-600 z-20">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                    {!isCameraOn && (
                         <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                            <p className="text-xs">Caméra coupée</p>
                         </div>
                    )}
                </div>
            )}

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-gray-900/70 backdrop-blur-sm p-3 rounded-full z-20">
                <button 
                    onClick={toggleMic} 
                    className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-900 ${isMicOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}
                    aria-label={isMicOn ? "Couper le micro" : "Activer le micro"}
                >
                    {isMicOn ? <MicOnIcon /> : <MicOffIcon />}
                </button>
                <button 
                    onClick={toggleCamera} 
                    className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-900 ${isCameraOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}
                    aria-label={isCameraOn ? "Couper la caméra" : "Activer la caméra"}
                >
                    {isCameraOn ? <VideoOnIcon /> : <VideoOffIcon />}
                </button>
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