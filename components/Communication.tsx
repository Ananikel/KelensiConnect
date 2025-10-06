import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Member, ChatMessage } from '../types';
import SearchIcon from './icons/SearchIcon';
import SendIcon from './icons/SendIcon';

interface CommunicationProps {
    members: Member[];
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const Communication: React.FC<CommunicationProps> = ({ members, messages, setMessages }) => {
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedMemberId]);

    const filteredMembers = useMemo(() => 
        members.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [members, searchTerm]);

    const selectedMember = useMemo(() => 
        members.find(m => m.id === selectedMemberId), 
    [members, selectedMemberId]);

    const conversation = useMemo(() => 
        messages.filter(msg => 
            (msg.senderId === 'admin' && msg.receiverId === selectedMemberId) ||
            (msg.senderId === selectedMemberId && msg.receiverId === 'admin')
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [messages, selectedMemberId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedMemberId) return;

        const newMsg: ChatMessage = {
            id: Date.now(),
            senderId: 'admin',
            receiverId: selectedMemberId,
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
    };

    return (
        <div className="bg-white rounded-lg shadow-md flex h-[calc(100vh-10rem)]">
            {/* Member List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                     <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Rechercher un membre..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredMembers.map(member => (
                        <div 
                            key={member.id}
                            onClick={() => setSelectedMemberId(member.id)}
                            className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 ${selectedMemberId === member.id ? 'bg-indigo-50' : ''}`}
                        >
                            <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover mr-4"/>
                            <div>
                                <p className="font-semibold text-gray-800">{member.name}</p>
                                <p className="text-sm text-gray-500">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="w-2/3 flex flex-col">
                {selectedMember ? (
                    <>
                        <div className="flex items-center p-4 border-b border-gray-200 shadow-sm">
                             <img src={selectedMember.avatar} alt={selectedMember.name} className="w-12 h-12 rounded-full object-cover mr-4"/>
                             <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedMember.name}</h3>
                                <p className={`text-sm ${selectedMember.status === 'Actif' ? 'text-green-600' : 'text-red-600'}`}>
                                    {selectedMember.status}
                                </p>
                             </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                            <div className="space-y-4">
                               {conversation.map(msg => (
                                   <div key={msg.id} className={`flex ${msg.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                       <div className={`max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                                           msg.senderId === 'admin' 
                                           ? 'bg-indigo-600 text-white rounded-br-none' 
                                           : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                       }`}>
                                           <p>{msg.text}</p>
                                           <p className={`text-xs mt-1 ${
                                               msg.senderId === 'admin' ? 'text-indigo-200' : 'text-gray-500'
                                           } text-right`}>
                                               {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                           </p>
                                       </div>
                                   </div>
                               ))}
                               <div ref={messagesEndRef} />
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                                <input 
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    autoComplete="off"
                                />
                                <button type="submit" className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300" disabled={!newMessage.trim()}>
                                    <SendIcon />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-center">
                        <div>
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune conversation sélectionnée</h3>
                            <p className="mt-1 text-sm text-gray-500">Sélectionnez un membre pour commencer à discuter.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Communication;
