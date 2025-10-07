// src/components/Communication.tsx - **CORRECTED**

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Member, ChatMessage, Attachment, Role } from '../types';
// Corrected relative path for icons from './icons/...' to '../icons/...'
import SearchIcon from '../icons/SearchIcon';
import SendIcon from '../icons/SendIcon';
import PaperclipIcon from '../icons/PaperclipIcon';
import FileIcon from '../icons/FileIcon';
import DownloadIcon from '../icons/DownloadIcon';
import UsersIcon from '../icons/UsersIcon';
import VideoIcon from '../icons/VideoIcon';
import PhoneIcon from '../icons/PhoneIcon';
// This import is correct (in the same directory)
import VideoCallModal from './VideoCallModal';
import ArrowLeftIcon from '../icons/ArrowLeftIcon';
import ReadReceiptIcon from '../icons/ReadReceiptIcon';
import ChatBubbleIcon from '../icons/ChatBubbleIcon';

interface CommunicationProps {
    members: Member[];
    messages: ChatMessage[];
    onSendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>) => Promise<void>;
    roles: Role[];
}

const Communication: React.FC<CommunicationProps> = ({ members, messages, onSendMessage, roles }) => {
    const [selectedId, setSelectedId] = useState<number | 0 | null>(null); // 0 for group chat
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [callType, setCallType] = useState<'audio' | 'video' | null>(null);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New state for selecting members for a custom group call
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(new Set());
    const [customCall, setCustomCall] = useState<{ type: 'audio' | 'video', members: Member[] } | null>(null);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedId]);
    
     useEffect(() => {
        if(attachment) {
            setNewMessage(attachment.name);
        } else {
            // Clear message if attachment is removed, unless it was modified
            if(fileInputRef.current?.value === '') {
                setNewMessage('');
            }
        }
    }, [attachment]);


    const filteredMembers = useMemo(() => 
        members.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [members, searchTerm]);
        
    const conversations = useMemo(() => {
        const convos = new Map<number | 0, ChatMessage[]>();
        members.forEach(m => convos.set(m.id, []));
        convos.set(0, []); // for group chat
        messages.forEach(msg => {
            if (msg.receiverId === 0) {
                 const groupChat = convos.get(0);
                 if(groupChat) groupChat.push(msg);
            } else {
                const memberId = msg.senderId === 'admin' ? msg.receiverId : msg.senderId;
                if (typeof memberId === 'number' && convos.has(memberId)) {
                    convos.get(memberId)?.push(msg);
                }
            }
        });
        convos.forEach(msgs => msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
        return convos;
    }, [messages, members]);


    const selectedMember = useMemo(() => 
        members.find(m => m.id === selectedId), 
    [members, selectedId]);

    const conversation = useMemo(() => {
        if (selectedId === null) return [];
        return conversations.get(selectedId) || [];
    }, [conversations, selectedId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachment) || selectedId === null || isSending) return;

        setIsSending(true);

        try {
            let attachmentData: Attachment | undefined = undefined;

            if (attachment) {
                attachmentData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        resolve({
                            name: attachment.name,
                            type: attachment.type,
                            url: event.target?.result as string,
                        });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(attachment);
                });
            }
            
            const textToSend = attachment && newMessage.trim() === attachment.name ? '' : newMessage.trim();

            const messageData: Omit<ChatMessage, 'id' | 'timestamp' | 'status'> = {
                senderId: 'admin',
                receiverId: selectedId,
                text: textToSend,
                attachment: attachmentData,
            };

            await onSendMessage(messageData);

            setNewMessage('');
            setAttachment(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };
    
    const handleStartCall = (type: 'audio' | 'video') => {
        if (selectedId === null) return;
        setCallType(type);
    };
    
    const handleStartChat = (memberId: number | 0) => {
        setSelectedId(memberId);
        setSelectedMemberIds(new Set()); // Clear group selection
    };

    const handleMemberToggle = (memberId: number) => {
        setSelectedId(null); // Clear active conversation when selecting members
        setSelectedMemberIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(memberId)) {
                newSet.delete(memberId);
            } else {
                newSet.add(memberId);
            }
            return newSet;
        });
    };

    const handleStartCustomCall = (type: 'audio' | 'video') => {
        const participants = members.filter(m => selectedMemberIds.has(m.id));
        if (participants.length > 0) {
            setCustomCall({ type, members: participants });
        }
    };

    const MessageAttachment: React.FC<{attachment: Attachment}> = ({attachment}) => {
        const isImage = attachment.type.startsWith('image/');
        
        if (isImage) {
            return (
                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                    <img src={attachment.url} alt={attachment.name} className="mt-2 rounded-lg max-w-xs cursor-pointer"/>
                </a>
            );
        }
        
        return (
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center">
                 <div className="text-gray-500 dark:text-gray-400 mr-3"><FileIcon /></div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{attachment.name}</p>
                 </div>
                 <a href={attachment.url} download={attachment.name} className="text-indigo-500 hover:text-indigo-400 ml-3 flex-shrink-0">
                    <DownloadIcon/>
                 </a>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex h-[calc(100vh-8.5rem)] md:h-[calc(100vh-10rem)] overflow-hidden">
                {/* Member List */}
                <div className={`relative w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex-col ${selectedId !== null || selectedMemberIds.size > 0 ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                         <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Rechercher un membre..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {/* Button to clear selection and focus on chat list */}
                                <button 
                                    onClick={() => { setSearchTerm(''); setSelectedId(null); setSelectedMemberIds(new Set()); }}
                                    className={`p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ${searchTerm || selectedId !== null || selectedMemberIds.size > 0 ? 'visible' : 'invisible'}`}
                                    aria-label="Effacer la recherche/sélection"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pb-28"> {/* Add padding-bottom for the action bar */}
                        {/* Group Chat */}
                        <div onClick={() => { handleStartChat(0); }} className={`flex items-center p-4 cursor-pointer w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${selectedId === 0 ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}`}>
                             <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-4 text-indigo-600 dark:text-indigo-400"><UsersIcon /></div>
                             <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">Discussion Générale</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Canal pour toute l'association</p>
                            </div>
                        </div>

                        {filteredMembers.map(member => {
                            const lastMessage = conversations.get(member.id)?.slice(-1)[0];
                            const isSelectedForGroup = selectedMemberIds.has(member.id);
                            const isSelectedForChat = selectedId === member.id;
                            return (
                                <div 
                                    key={member.id} 
                                    onClick={() => handleMemberToggle(member.id)}
                                    className={`flex items-center p-4 w-full text-left cursor-pointer transition-colors ${isSelectedForGroup || isSelectedForChat ? 'bg-indigo-50 dark:bg-indigo-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <div className="flex items-center flex-1 min-w-0">
                                        <input
                                            type="checkbox"
                                            readOnly
                                            checked={isSelectedForGroup}
                                            className="h-5 w-5 rounded border-gray-300 dark:border-gray-500 text-indigo-600 focus:ring-indigo-500 mr-4 flex-shrink-0 pointer-events-none"
                                            aria-label={`Sélectionner ${member.name} pour un appel de groupe`}
                                        />
                                        <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover mr-4"/>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{member.name}</p>
                                            {lastMessage ? (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {lastMessage.senderId === 'admin' && 'Vous: '}{lastMessage.text || 'Pièce jointe'}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{roles.find(r => r.id === member.roleId)?.name || 'Membre'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleStartChat(member.id); }} 
                                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        aria-label={`Démarrer une discussion avec ${member.name}`}
                                    >
                                        <ChatBubbleIcon />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {selectedMemberIds.size > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-[0_-2px_5px_rgba(0,0,0,0.1)] z-10 animate-slide-up">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {selectedMemberIds.size} membre{selectedMemberIds.size > 1 ? 's' : ''} sélectionné{selectedMemberIds.size > 1 ? 's' : ''}
                                </p>
                                <button
                                    onClick={() => setSelectedMemberIds(new Set())}
                                    className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                                >
                                    Annuler
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <button
                                    onClick={() => handleStartCustomCall('audio')}
                                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <PhoneIcon />
                                    <span className="ml-2">Appel Audio</span>
                                </button>
                                <button
                                    onClick={() => handleStartCustomCall('video')}
                                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <VideoIcon />
                                    <span className="ml-2">Appel Vidéo</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Window */}
                 <div className={`w-full md:w-2/3 flex-col ${(selectedId === null && selectedMemberIds.size === 0) ? 'hidden md:flex' : 'flex'}`}>
                     {selectedId !== null ? (
                        <>
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="flex items-center min-w-0">
                                     <button onClick={() => setSelectedId(null)} className="md:hidden p-2 -ml-2 mr-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" aria-label="Retour à la liste">
                                         <ArrowLeftIcon />
                                     </button>
                                     <div className="w-12 h-12 rounded-full object-cover mr-4 flex-shrink-0 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                                        { selectedId === 0 
                                            ? <div className="w-8 h-8"><UsersIcon /></div> 
                                            : <img src={selectedMember?.avatar} alt={selectedMember?.name} className="w-12 h-12 rounded-full object-cover"/>
                                        }
                                     </div>
                                     <div className="min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{selectedId === 0 ? 'Discussion Générale' : selectedMember?.name}</h3>
                                        { selectedId !== 0 && selectedMember &&
                                            <p className={`text-sm ${selectedMember.status === 'Actif' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {selectedMember.status}
                                            </p>
                                        }
                                     </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="flex items-center space-x-2 sm:space-x-4">
                                        <button onClick={() => handleStartCall('audio')} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800" aria-label={`Démarrer un appel ${selectedId === 0 ? 'de groupe ' : ''}audio`}>
                                            <PhoneIcon />
                                        </button>
                                        <button onClick={() => handleStartCall('video')} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800" aria-label={`Démarrer un appel ${selectedId === 0 ? 'de groupe ' : ''}vidéo`}>
                                            <VideoIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                                <div className="space-y-4">
                                   {conversation.map(msg => {
                                        const member = members.find(m => m.id === msg.senderId);
                                        return (
                                        <div key={msg.id} className={`flex gap-3 ${msg.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.senderId !== 'admin' && (
                                                <img src={member?.avatar} alt={member?.name} className="w-8 h-8 rounded-full object-cover self-end"/>
                                            )}
                                            <div className={`max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                                                msg.senderId === 'admin' 
                                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                            }`}>
                                                { msg.text && <p className="break-words">{msg.text}</p> }
                                                { msg.attachment && <MessageAttachment attachment={msg.attachment} /> }
                                                <p className={`text-xs mt-1 ${
                                                    msg.senderId === 'admin' ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                                                } text-right flex items-center justify-end space-x-1`}>
                                                    <span>{new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {msg.senderId === 'admin' && msg.status && <ReadReceiptIcon status={msg.status} />}
                                                </p>
                                            </div>
                                        </div>
                                   )})}
                                   <div ref={messagesEndRef} />
                                </div>
                            </div>

                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-4">
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800" aria-label="Joindre un fichier">
                                        <PaperclipIcon />
                                    </button>
                                    <input 
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.currentTarget.value)} 
                                        placeholder={attachment ? 'Ajouter un message...' : 'Écrire un message...'}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                        disabled={isSending}
                                    />
                                    <button type="submit" disabled={isSending || (!newMessage.trim() && !attachment)} className="p-3 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors disabled:bg-indigo-400 dark:disabled:bg-indigo-700" aria-label="Envoyer le message">
                                        <SendIcon />
                                    </button>
                                </form>
                                {attachment && (
                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
                                        <span>Pièce jointe : <span className="font-semibold text-gray-900 dark:text-gray-100">{attachment.name}</span></span>
                                        <button onClick={() => { setAttachment(null); setNewMessage(''); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="text-red-500 hover:text-red-700 ml-2" aria-label="Supprimer la pièce jointe">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-6 text-center text-gray-500 dark:text-gray-400">
                            {selectedMemberIds.size > 0 ? (
                                <p className="text-lg font-semibold">Prêt à démarrer un appel de groupe !</p>
                            ) : (
                                <p className="text-lg font-semibold">Sélectionnez un membre ou la discussion générale pour commencer.</p>
                            )}
                        </div>
                    )}
                 </div>
            </div>
            {callType && (selectedId !== null) && (
                <VideoCallModal 
                    isOpen={!!callType}
                    type={callType}
                    onEnd={() => setCallType(null)}
                    member={selectedId !== 0 ? selectedMember : undefined}
                    isGroup={selectedId === 0}
                />
            )}
            {customCall && (
                <VideoCallModal 
                    isOpen={!!customCall}
                    type={customCall.type}
                    onEnd={() => setCustomCall(null)}
                    members={customCall.members}
                    isGroup={true}
                />
            )}
        </>
    );
};

export default Communication;
