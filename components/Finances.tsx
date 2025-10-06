import React, { useState, useMemo } from 'react';
import { Contribution, Member } from '../types';
import SearchIcon from './icons/SearchIcon';
import PlusIcon from './icons/PlusIcon';
import CloseIcon from './icons/CloseIcon';
import DownloadIcon from './icons/DownloadIcon';


interface FinancesProps {
    members: Member[];
    contributions: Contribution[];
    setContributions: React.Dispatch<React.SetStateAction<Contribution[]>>;
}

const Finances: React.FC<FinancesProps> = ({ members, contributions, setContributions }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [typeFilter, setTypeFilter] = useState('Tous');
    const [isModalOpen, setModalOpen] = useState(false);

    // Form state
    const [memberId, setMemberId] = useState<number | ''>('');
    const [amount, setAmount] = useState<number | ''>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'Cotisation' | 'Don' | 'Événement'>('Cotisation');
    const [status, setStatus] = useState<'Payé' | 'En attente'>('Payé');


    const filteredContributions = useMemo(() => {
        return contributions.filter(c => {
            const matchesSearch = c.memberName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'Tous' || c.status === statusFilter;
            const matchesType = typeFilter === 'Tous' || c.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [contributions, searchTerm, statusFilter, typeFilter]);
    
    const resetForm = () => {
        setMemberId('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setType('Cotisation');
        setStatus('Payé');
    };

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => {
        setModalOpen(false);
        resetForm();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberId || !amount || amount <= 0) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }
        
        const selectedMember = members.find(m => m.id === memberId);
        if (!selectedMember) return;

        const newContribution: Contribution = {
            id: Date.now(),
            memberId,
            memberName: selectedMember.name,
            amount,
            date,
            type,
            status,
        };
        setContributions(prev => [newContribution, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        handleCloseModal();
    };

    const handleExportContributions = () => {
        const headers = ['ID Contribution', 'ID Membre', 'Nom du Membre', 'Montant (CFA)', 'Date', 'Type', 'Statut'];
        const csvRows = [
            headers.join(','),
            ...contributions.map(c => [
                c.id,
                c.memberId,
                `"${c.memberName.replace(/"/g, '""')}"`, // Escape quotes and wrap
                c.amount,
                new Date(c.date).toLocaleDateString('fr-FR'),
                c.type,
                c.status
            ].join(','))
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'contributions_kelensiconnect.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Rechercher par nom..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="Tous">Tous Types</option>
                            <option value="Cotisation">Cotisation</option>
                            <option value="Don">Don</option>
                            <option value="Événement">Événement</option>
                        </select>
                         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="Tous">Tous Statuts</option>
                            <option value="Payé">Payé</option>
                            <option value="En attente">En attente</option>
                        </select>
                        <button onClick={handleExportContributions} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors shadow">
                            <DownloadIcon />
                            <span className="ml-2 hidden md:inline">Exporter</span>
                        </button>
                         <button onClick={handleOpenModal} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow">
                            <PlusIcon />
                            <span className="ml-2 hidden md:inline">Ajouter</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredContributions.map((c: Contribution) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.memberName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.amount.toLocaleString('fr-FR')} CFA</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(c.date).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            c.status === 'Payé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredContributions.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Aucune contribution trouvée.
                    </div>
                )}
            </div>
            
            {/* Add Contribution Modal */}
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Ajouter une Contribution</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">Membre</label>
                                <select id="memberId" value={memberId} onChange={e => setMemberId(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                                    <option value="" disabled>Sélectionner un membre</option>
                                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Montant (CFA)</label>
                                <input type="number" id="amount" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                                    <select id="type" value={type} onChange={e => setType(e.target.value as any)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                                        <option>Cotisation</option>
                                        <option>Don</option>
                                        <option>Événement</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut</label>
                                    <select id="status" value={status} onChange={e => setStatus(e.target.value as any)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                                        <option>Payé</option>
                                        <option>En attente</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2">Annuler</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md">Ajouter</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Finances;