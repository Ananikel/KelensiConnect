import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
// Import du type ChatMessage qui était manquant
import { Member, Attachment, ChatMessage, Role } from '../types'; 
// CORRECTION TS2307: Tous les imports d'icônes passent de './icons/' à '../icons/'
import SearchIcon from '../icons/SearchIcon';
import SendIcon from '../icons/SendIcon'; 
import PaperclipIcon from '../icons/PaperclipIcon'; 
import FileIcon from '../icons/FileIcon'; 
import DownloadIcon from '../icons/DownloadIcon'; 
import UsersIcon from '../icons/UsersIcon';
import VideoIcon from '../icons/VideoIcon'; 
import PhoneIcon from '../icons/PhoneIcon'; 
import VideoCallModal from './VideoCallModal'; // Supposant qu'il est dans le même dossier
import ArrowLeftIcon from '../icons/ArrowLeftIcon'; 
import ReadReceiptIcon from '../icons/ReadReceiptIcon'; 
import ChatBubbleIcon from '../icons/ChatBubbleIcon'; 

interface CommunicationProps {
    members: Member[];
    messages: ChatMessage[];
    onSendMessage: (content: string, attachments?: Attachment[]) => void;
    theme: 'light' | 'dark';
    roles: Role[];
}

const Communication: React.FC<CommunicationProps> = ({ members, messages, onSendMessage, theme, roles }) => {
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const filteredMembers = useMemo(() => {
        if (!searchTerm) return members;
        return members.filter(member =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [members, searchTerm]);

    const handleSendMessage = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (messageInput.trim() || uploadedAttachments.length > 0) {
            onSendMessage(messageInput.trim(), uploadedAttachments);
            setMessageInput('');
            setUploadedAttachments([]);
        }
    }, [messageInput, uploadedAttachments, onSendMessage]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, currentChatId]);

    const chatMessages = useMemo(() => {
        // En production, cette logique serait plus complexe (filtrage par chat/contact)
        return messages.filter(msg => msg.senderId === currentChatId || msg.id.toString() === currentChatId);
    }, [messages, currentChatId]);

    const renderChatList = () => (
        // ... (Logique de rendu de la liste de chat, utilisant filteredMembers)
        // [omitted for brevity, assume correct rendering]
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Rechercher un membre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredMembers.map(member => (
                    <div
                        key={member.id}
                        onClick={() => setCurrentChatId(member.id.toString())}
                        className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${currentChatId === member.id.toString() ? 'bg-gray-100 dark:bg-gray-700 border-l-4 border-indigo-500' : ''}`}
                    >
                        <img src={member.avatar || `https://placehold.co/40x40/${theme === 'dark' ? '1f2937' : 'e5e7eb'}/ffffff?text=${member.name.charAt(0)}`} alt={member.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Cliquez pour chatter...</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Placeholder for attachment state and functions (as per error log)
    const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>([]);
    
    // Correction de l'erreur TS2353 sur l'objet literal d'attachement
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            if (file) {
                const newAttachment: Attachment = {
                    id: Date.now().toString(),
                    name: file.name,
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    url: URL.createObjectURL(file), 
                };
                setUploadedAttachments(prev => [...prev, newAttachment]);
            }
        }
    };

    const handleRemoveAttachment = (id: string) => {
        setUploadedAttachments(prev => prev.filter(a => a.id !== id));
    };


    const renderChatWindow = () => {
        const currentMember = members.find(m => m.id.toString() === currentChatId);

        if (!currentMember) {
            return (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <ChatBubbleIcon className="w-8 h-8 mr-2" />
                    Sélectionnez un membre pour commencer la discussion.
                </div>
            );
        }

        return (
            <div className="flex flex-col h-full">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center">
                        <button onClick={() => setCurrentChatId(null)} className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>
                        <img src={currentMember.avatar || `https://placehold.co/40x40/${theme === 'dark' ? '1f2937' : 'e5e7eb'}/ffffff?text=${currentMember.name.charAt(0)}`} alt={currentMember.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{currentMember.name}</h4>
                            <p className="text-sm text-green-500">Actif</p>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={() => {}} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" title="Démarrer appel vidéo">
                            <VideoIcon />
                        </button>
                        <button onClick={() => {}} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" title="Démarrer appel vocal">
                            <PhoneIcon />
                        </button>
                        <button onClick={() => {}} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" title="Voir les membres du groupe">
                            <UsersIcon />
                        </button>
                    </div>
                </div>

                {/* Chat Body */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                    {chatMessages.map(msg => {
                        const isMine = msg.senderId === 'current_user_id'; // Placeholder
                        return (
                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl shadow ${isMine ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none'}`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    {msg.attachments && msg.attachments.map((att) => (
                                        <a 
                                            key={att.id}
                                            href={att.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className={`mt-2 flex items-center p-2 rounded-lg ${isMine ? 'bg-indigo-700' : 'bg-gray-200 dark:bg-gray-600'}`}
                                            title={`Télécharger ${att.name}`}
                                        >
                                            <DownloadIcon className="w-5 h-5 mr-2" />
                                            <span className="truncate text-sm">{att.name}</span>
                                        </a>
                                    ))}
                                    <div className={`mt-1 text-xs ${isMine ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'} flex justify-end items-center`}>
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                        {isMine && <ReadReceiptIcon status={msg.status} className="ml-1 w-4 h-4" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Chat Input */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    {uploadedAttachments.length > 0 && (
                         <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-wrap gap-2">
                             {uploadedAttachments.map(att => (
                                 <div key={att.id} className="flex items-center text-sm bg-gray-200 dark:bg-gray-600 p-1.5 rounded-full">
                                     <span className="truncate max-w-xs">{att.name}</span>
                                     <button 
                                         onClick={() => handleRemoveAttachment(att.id)}
                                         className="ml-1 p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500"
                                     >
                                         <CloseIcon className="w-3 h-3"/>
                                     </button>
                                 </div>
                             ))}
                         </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                        <label className="cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                            <PaperclipIcon />
                            <input type="file" onChange={handleFileUpload} className="hidden" />
                        </label>
                        <textarea
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e as any);
                                }
                            }}
                            rows={1}
                            placeholder="Écrivez un message..."
                            className="flex-1 resize-none overflow-y-auto max-h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
                        />
                        <button 
                            type="submit" 
                            disabled={!messageInput.trim() && uploadedAttachments.length === 0}
                            className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                            <SendIcon />
                        </button>
                    </form>
                </div>
                
                {/* Video Modal Placeholder */}
                {isVideoModalOpen && (
                    <VideoCallModal 
                        onClose={() => setIsVideoModalOpen(false)} 
                        theme={theme} 
                        currentMember={currentMember}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex overflow-hidden">
            <div className={`w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 ${currentChatId && 'hidden md:block'}`}>
                {renderChatList()}
            </div>
            <div className={`flex-1 ${!currentChatId && 'hidden md:block'}`}>
                {renderChatWindow()}
            </div>
        </div>
    );
};

export default Communication;
