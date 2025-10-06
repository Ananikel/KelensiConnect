
import React, { useState } from 'react';
import { MOCK_ANNOUNCEMENTS } from '../constants';
import { Announcement } from '../types';

const Communication: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title || !content) return;

        const newAnnouncement: Announcement = {
            id: Date.now(),
            title,
            content,
            date: new Date().toISOString().split('T')[0]
        };

        setAnnouncements([newAnnouncement, ...announcements]);
        setTitle('');
        setContent('');
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* New Announcement Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Nouvelle Annonce</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Titre</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            id="content"
                            rows={6}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        ></textarea>
                    </div>
                     <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Envoyer l'Annonce
                        </button>
                    </div>
                </form>
            </div>

            {/* Past Announcements */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Annonces Précédentes</h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {announcements.map(announcement => (
                        <div key={announcement.id} className="border border-gray-200 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900">{announcement.title}</h4>
                                <span className="text-xs text-gray-500">{new Date(announcement.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{announcement.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Communication;
