import React, { useState, useMemo, useEffect } from 'react';
import { Role, Permission, Member } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import CloseIcon from './icons/CloseIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

interface RolesPermissionsProps {
    roles: Role[];
    permissions: Permission[];
    members: Member[];
    onBack: () => void;
    onSaveRole: (role: Role) => void;
    onDeleteRole: (roleId: string) => void;
}

const RoleModal: React.FC<{
    role: Role | null;
    onClose: () => void;
    onSave: (role: Role) => void;
    permissionsByCategory: Record<string, Permission[]>;
}> = ({ role, onClose, onSave, permissionsByCategory }) => {
    const [name, setName] = useState(role?.name || '');
    const [description, setDescription] = useState(role?.description || '');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set(role?.permissionIds || []));

    const handlePermissionToggle = (permissionId: string) => {
        setSelectedPermissionIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permissionId)) {
                newSet.delete(permissionId);
            } else {
                newSet.add(permissionId);
            }
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const roleId = role?.id || name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        onSave({
            id: roleId,
            name,
            description,
            permissionIds: Array.from(selectedPermissionIds),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">{role ? 'Modifier le rôle' : 'Ajouter un rôle'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} id="role-modal-form" className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label htmlFor="role-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du rôle</label>
                        <input type="text" id="role-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                    </div>
                    <div>
                        <label htmlFor="role-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea id="role-desc" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                    </div>
                    <div>
                        <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Permissions</h4>
                        <div className="space-y-4">
                            {Object.entries(permissionsByCategory).map(([category, perms]) => (
                                <div key={category}>
                                    <h5 className="font-semibold text-gray-700 dark:text-gray-300">{category}</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                                        {perms.map(p => (
                                            <label key={p.id} className="flex items-center space-x-3 cursor-pointer">
                                                <input type="checkbox" checked={selectedPermissionIds.has(p.id)} onChange={() => handlePermissionToggle(p.id)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                                <span className="text-sm text-gray-800 dark:text-gray-200">{p.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
                 <div className="bg-gray-50 dark:bg-gray-700/50 mt-auto px-6 py-4 flex justify-end space-x-3 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500">Annuler</button>
                    <button type="submit" form="role-modal-form" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Enregistrer</button>
                </div>
            </div>
        </div>
    );
};


const DeleteRoleModal: React.FC<{
    role: Role;
    onClose: () => void;
    onConfirm: () => void;
    isRoleInUse: boolean;
}> = ({ role, onClose, onConfirm, isRoleInUse }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Confirmer la suppression</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Êtes-vous sûr de vouloir supprimer le rôle <strong>"{role.name}"</strong> ? Cette action est irréversible.
                </p>
                {isRoleInUse && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 rounded-md text-sm text-red-700 dark:text-red-300">
                        Ce rôle ne peut pas être supprimé car il est actuellement assigné à un ou plusieurs membres.
                    </div>
                )}
                </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500">Annuler</button>
                <button type="button" onClick={onConfirm} disabled={isRoleInUse} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed">Supprimer</button>
            </div>
        </div>
    </div>
);


const RolesPermissions: React.FC<RolesPermissionsProps> = ({ roles, permissions, members, onBack, onSaveRole, onDeleteRole }) => {
    const [selectedRole, setSelectedRole] = useState<Role | null>(roles.length > 0 ? roles[0] : null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

    const permissionsByCategory = useMemo(() => {
        return permissions.reduce((acc, p) => {
            (acc[p.category] = acc[p.category] || []).push(p);
            return acc;
        }, {} as Record<string, Permission[]>);
    }, [permissions]);

    const isRoleInUse = (roleId: string) => members.some(m => m.roleId === roleId);

    const handleAddRole = () => {
        setRoleToEdit(null);
        setModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setRoleToEdit(role);
        setModalOpen(true);
    };

    const handleOpenDeleteModal = (role: Role) => {
        setRoleToDelete(role);
    };

    const handleConfirmDelete = () => {
        if (roleToDelete) {
            onDeleteRole(roleToDelete.id);
            if(selectedRole?.id === roleToDelete.id) {
                const remainingRoles = roles.filter(r => r.id !== roleToDelete.id);
                setSelectedRole(remainingRoles.length > 0 ? remainingRoles[0] : null);
            }
            setRoleToDelete(null);
        }
    };
    
    useEffect(() => {
        if (!selectedRole || !roles.find(r => r.id === selectedRole.id)) {
            setSelectedRole(roles[0] || null);
        }
    }, [roles, selectedRole]);


    return (
        <>
            <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-4">
                            <ArrowLeftIcon />
                        </button>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Rôles & Permissions</h2>
                    </div>
                     <button onClick={handleAddRole} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <PlusIcon /> <span className="ml-2 hidden sm:inline">Ajouter un rôle</span>
                    </button>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400">
                   Gérez les rôles des utilisateurs pour contrôler l'accès aux différentes fonctionnalités de l'application.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 space-y-2 self-start">
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role)}
                                className={`w-full flex justify-between items-center p-3 rounded-lg text-left transition-colors ${selectedRole?.id === role.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{role.name}</span>
                                <div className="flex space-x-2">
                                     <button onClick={(e) => { e.stopPropagation(); handleEditRole(role); }} className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-full" aria-label={`Modifier ${role.name}`}><EditIcon /></button>
                                     <button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(role); }} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-full" aria-label={`Supprimer ${role.name}`}><DeleteIcon /></button>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="md:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 self-start min-h-[400px]">
                        {selectedRole ? (
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{selectedRole.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">{selectedRole.description}</p>
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b dark:border-gray-700 pb-2">Permissions accordées</h4>
                                {selectedRole.permissionIds.length > 0 ? (
                                     <ul className="space-y-3">
                                        {permissions.filter(p => selectedRole.permissionIds.includes(p.id)).map(p => (
                                            <li key={p.id} className="flex items-start">
                                                <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-green-500"><ShieldCheckIcon /></div>
                                                <div className="ml-3">
                                                    <p className="font-medium text-gray-800 dark:text-gray-200">{p.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{p.description}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">Aucune permission accordée à ce rôle.</p>
                                )}
                            </div>
                        ) : (
                             <div className="text-center py-10 text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
                                <p>Sélectionnez ou créez un rôle pour gérer ses permissions.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && <RoleModal role={roleToEdit} onClose={() => setModalOpen(false)} onSave={(r) => { onSaveRole(r); setModalOpen(false); }} permissionsByCategory={permissionsByCategory} />}
            {roleToDelete && <DeleteRoleModal role={roleToDelete} onClose={() => setRoleToDelete(null)} onConfirm={handleConfirmDelete} isRoleInUse={isRoleInUse(roleToDelete.id)} />}
        </>
    );
};

export default RolesPermissions;
