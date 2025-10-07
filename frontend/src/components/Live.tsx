import React, { useState, useRef, useEffect, useCallback } from 'react';
// Correction TS2305: LiveSession n'est pas exporté par le SDK à cette version.
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAI_Blob } from '@google/genai'; 
// Correction TS2307: Vérification du chemin d'accès aux icônes
import MicOnIcon from '../icons/MicOnIcon';
import PhoneIcon from '../icons/PhoneIcon';

interface LiveProps {
    theme: 'light' | 'dark';
}

interface Message {
    id: string;
    sender: 'user' | 'model';
    text: string;
    serverContent?: LiveServerMessage;
}

type LiveSessionState = 'idle' | 'connecting' | 'active' | 'error';

// --- Audio Helper Functions (from Gemini API guidelines) ---

function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    // Deinterleave and normalize
    for (let channel = 0; channel < numChannels; channel++) {
        const nowBuffering = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Convert 16-bit to float (-1.0 to 1.0)
            nowBuffering[i] = dataInt16[i * numChannels + channel] / 32768;
        }
    }
    return buffer;
}

// -----------------------------------------------------------

const Live: React.FC<LiveProps> = ({ theme }) => {
    const [sessionState, setSessionState] = useState<LiveSessionState>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [userAudioQueue, setUserAudioQueue] = useState<Uint8Array[]>([]);
    const [currentTranscription, setCurrentTranscription] = useState<{ user: string, model: string }>({ user: '', model: '' });
    const [isMicActive, setIsMicActive] = useState(false);
    const [inputMode, setInputMode] = useState<'text' | 'voice'>('voice');
    const [textInput, setTextInput] = useState('');
    
    // Refs pour la session et l'audio
    const genAiRef = useRef<GoogleGenAI | null>(null);
    const sessionRef = useRef<any>(null); // Utilisation de 'any' pour contourner le manque de type LiveSession
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // Fonction pour obtenir l'instance GoogleGenAI
    const getAiModel = useCallback(() => {
        // CORRECTION TS2580: Référence à process.env doit être résolue par tsconfig.node.json
        return new GoogleGenAI({ 
            apiKey: process.env.VITE_API_KEY, 
            server: process.env.NODE_ENV === 'development' ? 'ws://localhost:8000/live' : undefined,
            // Autres configurations si nécessaire
        });
    }, []);

    // Fonction pour faire défiler le transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentTranscription]);


    const handleSessionMessage = useCallback((message: LiveServerMessage) => {
        if (message.serverContent) {
            // Traiter la transcription de l'utilisateur
            if (message.serverContent.userTurn) {
                const userText = message.serverContent.userTurn.parts
                    .map(part => part.text)
                    .join(' ')
                    .trim();

                setCurrentTranscription(prev => ({ ...prev, user: userText }));

                if (message.serverContent.userTurn.isFinal) {
                    setMessages(prev => [
                        ...prev, 
                        { id: Date.now().toString() + '-user', sender: 'user', text: userText }
                    ]);
                    setCurrentTranscription(prev => ({ ...prev, user: '' }));
                }
            }

            // Traiter la réponse du modèle
            if (message.serverContent.modelTurn) {
                // CORRECTION TS18048 & TS2532: Vérification des optionnels 
                const modelText = message.serverContent.modelTurn.parts
                    ? message.serverContent.modelTurn.parts.map(part => part.text).join(' ').trim()
                    : '';

                setCurrentTranscription(prev => ({ ...prev, model: modelText }));

                if (message.serverContent.modelTurn.isFinal) {
                    setMessages(prev => [
                        ...prev, 
                        { id: Date.now().toString() + '-model', sender: 'model', text: modelText, serverContent: message }
                    ]);
                    setCurrentTranscription(prev => ({ ...prev, model: '' }));
                    
                    // Traiter l'audio du modèle
                    if (message.serverContent.modelTurn.audio?.data) {
                        const audioData = decode(message.serverContent.modelTurn.audio.data);
                        setUserAudioQueue(prev => [...prev, audioData]);
                    }
                }
            }
        }
    }, []);

    const playAudioQueue = useCallback(async () => {
        if (!userAudioQueue.length) return;

        const audioData = userAudioQueue[0];
        setUserAudioQueue(prev => prev.slice(1));
        
        if (!audioContextRef.current) return;

        try {
            const audioBuffer = await decodeAudioData(
                audioData, 
                audioContextRef.current, 
                16000, 
                1
            );

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start(0);

            // Attendre la fin de la lecture pour passer au suivant
            await new Promise(resolve => source.onended = resolve);
            
            // Continuer la lecture récursivement
            playAudioQueue();

        } catch (error) {
            console.error("Error playing audio:", error);
            // Continuer la lecture même en cas d'erreur
            playAudioQueue(); 
        }

    }, [userAudioQueue]);

    useEffect(() => {
        if (userAudioQueue.length > 0) {
            playAudioQueue();
        }
    }, [userAudioQueue, playAudioQueue]);

    // Initialisation de la session
    const handleStartSession = useCallback(async () => {
        setSessionState('connecting');
        setMessages([]);
        setCurrentTranscription({ user: '', model: '' });

        try {
            if (!genAiRef.current) {
                genAiRef.current = getAiModel();
            }

            // Initialiser l'audio
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            
            // Initialiser l'enregistreur
            recorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
            const audioChunks: BlobPart[] = [];
            
            recorderRef.current.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            recorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioData = new Uint8Array(arrayBuffer);
                
                // Envoyer les données au modèle si la session est active
                if (sessionRef.current) {
                    sessionRef.current.send({
                        userContent: {
                            parts: [{ 
                                audio: {
                                    data: encode(audioData),
                                    mimeType: 'audio/webm;codecs=opus'
                                } 
                            }]
                        }
                    });
                }
            };

            // Démarrer la session Live (utiliser 'any' car le type LiveSession n'est pas exporté)
            sessionRef.current = genAiRef.current.live.createSession({
                stream: true,
                modality: Modality.SPEECH,
                // Configuration de l'audio
            });

            sessionRef.current.on('message', handleSessionMessage);
            sessionRef.current.on('error', (err: any) => {
                console.error("Live session error:", err);
                setSessionState('error');
            });
            sessionRef.current.on('close', () => {
                console.log("Live session closed.");
                setSessionState('idle');
            });
            
            setSessionState('active');

        } catch (err) {
            console.error("Failed to start live session:", err);
            setSessionState('error');
        }
    }, [getAiModel, handleSessionMessage]);


    const handleEndSession = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (audioSourceRef.current) {
            audioSourceRef.current.disconnect();
            audioSourceRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (recorderRef.current) {
            recorderRef.current.stop();
            recorderRef.current = null;
        }
        setSessionState('idle');
    }, []);

    const handleToggleMic = useCallback(() => {
        if (sessionState !== 'active') return;

        if (isMicActive) {
            if (recorderRef.current?.state === 'recording') {
                recorderRef.current.stop();
            }
            setIsMicActive(false);
        } else {
            // Redémarrer l'enregistrement pour commencer à collecter de l'audio
            if (recorderRef.current?.state === 'inactive') {
                recorderRef.current.start(250); // Enregistre des chunks toutes les 250ms
            } else if (recorderRef.current?.state === 'paused') {
                recorderRef.current.resume();
            }
            setIsMicActive(true);
        }
    }, [sessionState, isMicActive]);

    const handleSendText = useCallback(() => {
        if (sessionState !== 'active' || !textInput.trim()) return;

        if (sessionRef.current) {
            sessionRef.current.send({
                userContent: {
                    parts: [{ text: textInput.trim() }]
                }
            });
            setMessages(prev => [
                ...prev, 
                { id: Date.now().toString() + '-user-text', sender: 'user', text: textInput.trim() }
            ]);
            setTextInput('');
        }
    }, [sessionState, textInput]);


    const renderContent = () => {
        switch (sessionState) {
            case 'idle':
                return (
                    <div className="flex flex-col items-center justify-center flex-1 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Démarrer une Session Live</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">Interagissez avec l'IA en temps réel via la voix ou le texte.</p>
                        <button 
                            onClick={handleStartSession} 
                            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Connecter
                        </button>
                    </div>
                );
            case 'connecting':
                return (
                    <div className="flex flex-col items-center justify-center flex-1 p-6">
                        <div className={`w-12 h-12 border-4 border-t-4 border-indigo-600 border-opacity-25 rounded-full animate-spin dark:border-white dark:border-opacity-50 dark:border-t-indigo-500 mb-4`}></div>
                        <p className="text-gray-600 dark:text-gray-400">Connexion en cours...</p>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center flex-1 p-6">
                        <span className="text-red-500 text-4xl mb-4">⚠️</span>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Erreur de Connexion</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">Une erreur s'est produite lors de la tentative de connexion au service Live. Veuillez réessayer.</p>
                        <button 
                            onClick={handleStartSession} 
                            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                );
            case 'active':
                return (
                    <div className="flex flex-col h-full">
                        {/* Chat/Transcript Area */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((message, index) => (
                                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow-md ${
                                        message.sender === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-tl-none'
                                    }`}>
                                        <p>{message.text}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Live Transcription */}
                            {(currentTranscription.user || currentTranscription.model) && (
                                <div className="flex justify-start">
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow-md bg-yellow-100 dark:bg-yellow-900 text-gray-900 dark:text-gray-200 rounded-tl-none border border-yellow-300 dark:border-yellow-700`}>
                                        {currentTranscription.user && (
                                            <p className="font-semibold text-sm text-yellow-800 dark:text-yellow-200">
                                                Vous: <span className="font-normal">{currentTranscription.user}</span>
                                            </p>
                                        )}
                                        {currentTranscription.model && (
                                            <p className="font-semibold text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                                                IA: <span className="font-normal">{currentTranscription.model}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div ref={transcriptEndRef} />
                        </div>
                        
                        {/* Input Area */}
                        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center space-y-4">
                            
                            {/* Toggle Text/Voice Input */}
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => setInputMode('voice')} 
                                    className={`px-4 py-2 text-sm rounded-full transition-colors ${
                                        inputMode === 'voice' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Mode Vocal
                                </button>
                                <button 
                                    onClick={() => setInputMode('text')} 
                                    className={`px-4 py-2 text-sm rounded-full transition-colors ${
                                        inputMode === 'text' 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Mode Texte
                                </button>
                            </div>
                            
                            {inputMode === 'voice' ? (
                                // Voice Controls
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative flex items-center justify-center w-20 h-20">
                                        {isMicActive && <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75"></div>}
                                        <button onClick={handleToggleMic} className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
                                            isMicActive 
                                            ? 'bg-red-600 hover:bg-red-500 text-white' 
                                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                        }`} aria-label={isMicActive ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement'}>
                                            <MicOnIcon/>
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {isMicActive ? 'Enregistrement en cours...' : 'Cliquez pour parler'}
                                    </p>
                                </div>
                            ) : (
                                // Text Controls
                                <div className="flex w-full max-w-lg space-x-2">
                                    <input
                                        type="text"
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        onKeyPress={(e) => { if (e.key === 'Enter') handleSendText(); }}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Tapez votre message ici..."
                                    />
                                    <button
                                        onClick={handleSendText}
                                        disabled={!textInput.trim()}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-500 transition-colors disabled:opacity-50"
                                    >
                                        Envoyer
                                    </button>
                                </div>
                            )}

                            <button onClick={handleEndSession} className="p-3 bg-red-600 rounded-full hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white dark:focus:ring-offset-gray-800" aria-label="Raccrocher">
                                <div className="rotate-[135deg]"><PhoneIcon /></div>
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex flex-col">
            {renderContent()}
        </div>
    );
};

export default Live;
