import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Member, ChatMessage, Attachment } from '../types';
import SearchIcon from './icons/SearchIcon';
import SendIcon from './icons/SendIcon';
import PaperclipIcon from './icons/PaperclipIcon';
import FileIcon from './icons/FileIcon';
import DownloadIcon from './icons/DownloadIcon';
import UsersIcon from './icons/UsersIcon';
import VideoIcon from './icons/VideoIcon';
import PhoneIcon from './icons/PhoneIcon';
import VideoCallModal from './VideoCallModal';

interface CommunicationProps {
    members: Member[];
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const Communication: React.FC<CommunicationProps> = ({ members, messages, setMessages }) => {
    const [selectedId, setSelectedId] = useState<number | 0 | null>(null); // 0 for group chat
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isCalling, setIsCalling] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedId]);
    
     useEffect(() => {
        if(attachment) {
            setNewMessage(attachment.name);
        }
    }, [attachment]);


    const filteredMembers = useMemo(() => 
        members.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [members, searchTerm]);

    const selectedMember = useMemo(() => 
        members.find(m => m.id === selectedId), 
    [members, selectedId]);

    const conversation = useMemo(() => {
        const targetReceiverId = selectedId === 0 ? 0 : selectedId;
        return messages.filter(msg => 
            (msg.senderId === 'admin' && msg.receiverId === targetReceiverId) ||
            (msg.senderId === targetReceiverId && msg.receiverId === 'admin') ||
            (targetReceiverId === 0 && msg.receiverId === 0) // Group chat messages
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, selectedId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachment) || selectedId === null) return;

        if (attachment) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newMsg: ChatMessage = {
                    id: Date.now(),
                    senderId: 'admin',
                    receiverId: selectedId,
                    text: newMessage.trim(),
                    timestamp: new Date().toISOString(),
                    attachment: {
                        name: attachment.name,
                        type: attachment.type,
                        url: e.target?.result as string,
                    }
                };
                setMessages(prev => [...prev, newMsg]);
            };
            reader.readAsDataURL(attachment);
        } else {
             const newMsg: ChatMessage = {
                id: Date.now(),
                senderId: 'admin',
                receiverId: selectedId,
                text: newMessage.trim(),
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, newMsg]);
        }
        
        setNewMessage('');
        setAttachment(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
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
                 <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{attachment.name}</p>
                 </div>
                 <a href={attachment.url} download={attachment.name} className="text-indigo-500 hover:text-indigo-400 ml-3">
                    <DownloadIcon/>
                 </a>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex h-[calc(100vh-10rem)]">
                {/* Member List */}
                <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
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
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {/* Group Chat */}
                        <div onClick={() => setSelectedId(0)} className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedId === 0 ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}`}>
                             <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-4 text-indigo-600 dark:text-indigo-400"><UsersIcon /></div>
                             <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">Discussion Générale</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Canal pour toute l'association</p>
                            </div>
                        </div>

                        {filteredMembers.map(member => (
                            <div 
                                key={member.id}
                                onClick={() => setSelectedId(member.id)}
                                className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedId === member.id ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}`}
                            >
                                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover mr-4"/>
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{member.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="w-2/3 flex flex-col">
                    {selectedId !== null ? (
                        <>
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="flex items-center">
                                     <div className="w-12 h-12 rounded-full object-cover mr-4 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                                        { selectedId === 0 
                                            ? <UsersIcon /> 
                                            : <img src={selectedMember?.avatar} alt={selectedMember?.name} className="w-12 h-12 rounded-full object-cover"/>
                                        }
                                     </div>
                                     <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedId === 0 ? 'Discussion Générale' : selectedMember?.name}</h3>
                                        { selectedId !== 0 && selectedMember &&
                                            <p className={`text-sm ${selectedMember.status === 'Actif' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {selectedMember.status}
                                            </p>
                                        }
                                     </div>
                                </div>
                                <div>
                                    {selectedId === 0 ? (
                                        <button onClick={() => setIsCalling(true)} className="flex items-center space-x-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" title="Démarrer un appel de groupe">
                                            <VideoIcon />
                                            <span>Appel de groupe</span>
                                        </button>
                                    ) : (
                                        <div className="flex items-center space-x-4">
                                            <button onClick={() => setIsCalling(true)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Appel Audio">
                                                <PhoneIcon />
                                            </button>
                                            <button onClick={() => setIsCalling(true)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Appel Vidéo">
                                                <VideoIcon />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                                <div className="space-y-4">
                                   {conversation.map(msg => (
                                       <div key={msg.id} className={`flex ${msg.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                           <div className={`max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                                               msg.senderId === 'admin' 
                                               ? 'bg-indigo-600 text-white rounded-br-none' 
                                               : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                           }`}>
                                               { msg.text && <p>{msg.text}</p> }
                                               { msg.attachment && <MessageAttachment attachment={msg.attachment} /> }
                                               <p className={`text-xs mt-1 ${
                                                   msg.senderId === 'admin' ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
                                               } text-right`}>
                                                   {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                               </p>
                                           </div>
                                       </div>
                                   ))}
                                   <div ref={messagesEndRef} />
                                </div>
                            </div>

                            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        <PaperclipIcon />
                                    </button>
                                    <input 
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder={attachment ? "Ajouter un commentaire..." : "Écrivez votre message..."}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                        autoComplete="off"
                                    />
                                    <button type="submit" className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300" disabled={!newMessage.trim() && !attachment}>
                                        <SendIcon />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center">
                            <div>
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">Aucune conversation sélectionnée</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sélectionnez un membre pour commencer à discuter.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isCalling && selectedId !== null && (
                <VideoCallModal 
                    isGroupCall={selectedId === 0}
                    targetMember={selectedId !== 0 ? selectedMember : undefined}
                    allMembers={members}
                    onClose={() => setIsCalling(false)}
                />
            )}
        </>
    );
};

export default Communication;