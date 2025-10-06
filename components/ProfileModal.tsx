
import React, { useState } from 'react';
import { UserProfile } from '../types';
import CloseIcon from './icons/CloseIcon';

interface ProfileModalProps {
    user: UserProfile;
    onSave: (updatedProfile: UserProfile) => void;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onSave, onClose }) => {
    const [name, setName] = useState(user.name);
    const [avatar, setAvatar] = useState(user.avatar);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, avatar });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">Modifier mon profil</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <CloseIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="text-center">
                        <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">URL de l'avatar</label>
                        <input
                            type="text"
                            id="avatar"
                            value={avatar}
                            onChange={e => setAvatar(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2">Annuler</button>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
