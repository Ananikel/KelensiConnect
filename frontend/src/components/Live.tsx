import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAI_Blob, LiveSession } from '@google/genai';
import MicOnIcon from '../icons/MicOnIcon'; // <-- CORRIGÉ
import PhoneIcon from '../icons/PhoneIcon'; // <-- CORRIGÉ

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

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): GenAI_Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}
// --- End Audio Helper Functions ---

type TranscriptionEntry = {
    speaker: 'user' | 'model';
    text: string;
    id: number;
};

type SessionState = 'idle' | 'connecting' | 'connected' | 'error';

const Live: React.FC = () => {
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    const [currentTranscription, setCurrentTranscription] = useState({ user: '', model: '' });

    const aiRef = useRef<GoogleGenAI | null>(null);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef(0);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const lastMessageId = useRef(0);

    const cleanup = useCallback(() => {
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;

        inputAudioContextRef.current?.close().catch(console.error);
        inputAudioContextRef.current = null;

        outputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current = null;

        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        
        outputSourcesRef.current.forEach(source => source.stop());
        outputSourcesRef.current.clear();
        
        sessionPromiseRef.current = null;
    }, []);

    const handleStartSession = useCallback(async () => {
        setSessionState('connecting');
        setErrorMessage(null);
        setTranscriptionHistory([]);
        setCurrentTranscription({ user: '', model: '' });
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';

        if (!process.env.API_KEY) {
            setErrorMessage("La clé API Gemini n'est pas configurée. Veuillez vérifier les variables d'environnement.");
            setSessionState('error');
            return;
        }

        try {
            if (!aiRef.current) {
                aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            sessionPromiseRef.current = aiRef.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setSessionState('connected');
                        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                        
                        const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle transcription
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                            setCurrentTranscription(prev => ({ ...prev, user: currentInputTranscriptionRef.current }));
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                            setCurrentTranscription(prev => ({ ...prev, model: currentOutputTranscriptionRef.current }));
                        }
                        if (message.serverContent?.turnComplete) {
                            const userInput = currentInputTranscriptionRef.current.trim();
                            const modelOutput = currentOutputTranscriptionRef.current.trim();
                            
                            setTranscriptionHistory(prev => [
                                ...prev,
                                ...(userInput ? [{ speaker: 'user' as const, text: userInput, id: ++lastMessageId.current }] : []),
                                ...(modelOutput ? [{ speaker: 'model' as const, text: modelOutput, id: ++lastMessageId.current }] : []),
                            ]);
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                            setCurrentTranscription({ user: '', model: '' });
                        }

                        // Handle audio playback
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContextRef.current.destination);
                            source.addEventListener('ended', () => outputSourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            outputSourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setErrorMessage("Une erreur de connexion est survenue durant la session.");
                        setSessionState('error');
                        cleanup();
                    },
                    onclose: () => {
                        setSessionState('idle');
                        cleanup();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: "Tu es un assistant vocal amical et serviable pour une association nommée KelensiConnect. Réponds de manière concise et naturelle.",
                },
            });
        } catch (error) {
            console.error('Failed to start session:', error);
            const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
            setErrorMessage(`Échec du démarrage de la session: ${message}. Vérifiez les autorisations du microphone.`);
            setSessionState('error');
            cleanup();
        }
    }, [cleanup]);

    const handleEndSession = useCallback(async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (error) {
                console.error("Error closing session:", error);
            }
        }
        cleanup();
        setSessionState('idle');
    }, [cleanup]);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcriptionHistory, currentTranscription]);

    useEffect(() => {
        return () => {
            handleEndSession();
        };
    }, [handleEndSession]);

    const BotIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3.375a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75zm0 3.75a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75zm0 3.75a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75z" clipRule="evenodd" />
        </svg>
    );
    
    const renderContent = () => {
        switch (sessionState) {
            case 'idle':
                return (
                    <div className="text-center m-auto">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                            <MicOnIcon className="w-8 h-8"/>
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Session Vocale Live</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Démarrez une conversation en temps réel avec l'assistant IA.</p>
                        <button onClick={handleStartSession} className="mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                            Démarrer la session
                        </button>
                    </div>
                );
            case 'connecting':
                return (
                    <div className="text-center m-auto">
                        <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Connexion...</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Veuillez autoriser l'accès à votre microphone.</p>
                    </div>
                );
            case 'error':
                return (
                    <div className="text-center m-auto p-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
                            <PhoneIcon className="w-8 h-8 rotate-[135deg]"/>
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Erreur de Session</h3>
                        <p className="mt-1 text-red-500 dark:text-red-400 font-medium">{errorMessage}</p>
                        <button onClick={handleStartSession} className="mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                            Réessayer
                        </button>
                    </div>
                );
            case 'connected':
                return (
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                                <span className="relative flex h-3 w-3 mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                En Ligne
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {transcriptionHistory.map((entry) => (
                                <div key={entry.id} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl ${
                                        entry.speaker === 'user' 
                                            ? 'bg-indigo-500 text-white rounded-br-none' 
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none'
                                    }`}>
                                        {entry.speaker === 'model' && <div className="font-bold text-sm mb-1 flex items-center"><BotIcon className="w-4 h-4 mr-1"/> Assistant</div>}
                                        {entry.text}
                                    </div>
                                </div>
                            ))}

                            {/* Current Realtime Transcription */}
                            {(currentTranscription.user || currentTranscription.model) && (
                                <div className="space-y-2">
                                    {currentTranscription.user && (
                                        <div className="flex justify-end">
                                            <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-br-none italic">
                                                {currentTranscription.user}
                                            </div>
                                        </div>
                                    )}
                                    {currentTranscription.model && (
                                        <div className="flex justify-start">
                                            <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-tl-none italic">
                                                <div className="font-bold text-sm mb-1 flex items-center text-gray-600 dark:text-gray-400"><BotIcon className="w-4 h-4 mr-1"/> Assistant (Réponse)</div>
                                                {currentTranscription.model}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div ref={transcriptEndRef} />
                        </div>
                        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center space-y-4">
                            <div className="relative flex items-center justify-center w-20 h-20">
                                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse"></div>
                                <div className="relative w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                    <MicOnIcon className="w-8 h-8"/>
                                </div>
                            </div>
                            <button onClick={handleEndSession} className="p-3 bg-red-600 rounded-full hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white dark:focus:ring-offset-gray-800" aria-label="Raccrocher">
                                <div className="rotate-[135deg]"><PhoneIcon className="w-6 h-6" /></div>
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
