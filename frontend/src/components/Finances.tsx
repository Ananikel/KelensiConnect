import React, { useState, useMemo, useEffect } from 'react';
import { Contribution, Member } from '../types';
// CORRECTION TS2307: Imports d'icônes corrigés de './icons/' à '../icons/'
import SearchIcon from '../icons/SearchIcon';
import PlusIcon from '../icons/PlusIcon';
import CloseIcon from '../icons/CloseIcon';
import DownloadIcon from '../icons/DownloadIcon';
import Pagination from './Pagination'; // Reste ./Pagination car il est dans le même dossier
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinancesProps {
    members: Member[];
    contributions: Contribution[];
    onAddContribution: (data: Omit<Contribution, 'id' | 'memberName'>) => Promise<void>;
    theme: 'light' | 'dark';
}

const ITEMS_PER_PAGE = 10;
const COLORS = {
    'Cotisation': '#4f46e5', // Indigo
    'Don': '#10b981',       // Green
    'Événement': '#f59e0b', // Amber
};

const Finances: React.FC<FinancesProps> = ({ members, contributions, onAddContribution, theme }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [typeFilter, setTypeFilter] = useState('Tous');
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [amount, setAmount] = useState<number | ''>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'Cotisation' | 'Don' | 'Événement'>('Cotisation');
    const [status, setStatus] = useState<'Payé' | 'En attente'>('Payé');
    const [isLoading, setIsLoading] = useState(false);

    // MAPPING DATA
    const contributionsWithMemberName = useMemo(() => {
        return contributions.map(c => ({
            ...c,
            memberName: members.find(m => m.id === c.memberId)?.name || 'Inconnu',
        }));
    }, [contributions, members]);

    const filteredContributions = useMemo(() => {
        let filtered = contributionsWithMemberName;

        if (searchTerm) {
            filtered = filtered.filter(c => 
                c.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'Tous') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }

        if (typeFilter !== 'Tous') {
            filtered = filtered.filter(c => c.type === typeFilter);
        }

        return filtered;
    }, [contributionsWithMemberName, searchTerm, statusFilter, typeFilter]);

    const totalPages = Math.ceil(filteredContributions.length / ITEMS_PER_PAGE);

    const paginatedContributions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredContributions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredContributions, currentPage]);

    // CHART DATA
    const chartData = useMemo(() => {
        const totals = contributions.reduce((acc, curr) => {
            acc[curr.type] = (acc[curr.type] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(totals).map(([name, value]) => ({
            name,
            value,
            color: COLORS[name as keyof typeof COLORS] || '#ccc',
        }));
    }, [contributions]);

    // RESET PAGINATION
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter]);


    const handleOpenModal = () => {
        setSelectedMemberId(members[0]?.id || null);
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setType('Cotisation');
        setStatus('Payé');
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setIsLoading(false);
    };

    const handleAddContribution = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedMemberId === null || amount === '') return;

        setIsLoading(true);
        try {
            await onAddContribution({
                memberId: selectedMemberId,
                amount: Number(amount),
                date,
                type,
                status,
            });
            handleCloseModal();
        } catch (error) {
            console.error("Erreur lors de l'ajout de la contribution:", error);
            setIsLoading(false);
        }
    };


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    // Placeholder for handleDownloadCSV function
    const handleDownloadCSV = () => {
        // Simple mock CSV generation
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Membre,Montant,Date,Type,Statut\n";
        contributionsWithMemberName.forEach(c => {
            csvContent += `${c.id},${c.memberName},${c.amount},${c.date},${c.type},${c.status}\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "contributions_kelensi.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Gestion des Finances</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Stats / Chart Area */}
                <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Répartition des types de contributions</h3>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    labelLine={false}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Stats Placeholder */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Contributions */}
                    <div className="bg-indigo-500 text-white p-4 rounded-lg shadow-lg">
                        <p className="text-sm">Total des contributions</p>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(contributions.reduce((sum, c) => sum + c.amount, 0))}</p>
                    </div>
                    {/* Paid vs Pending */}
                    <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg">
                        <p className="text-sm">Contributions Payées</p>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(contributions.filter(c => c.status === 'Payé').reduce((sum, c) => sum + c.amount, 0))}</p>
                    </div>
                    {/* Active Members */}
                    <div className="bg-yellow-500 text-gray-900 p-4 rounded-lg shadow-lg">
                        <p className="text-sm">Membres Actifs</p>
                        <p className="text-3xl font-bold mt-1">{members.filter(m => m.status === 'Actif').length}</p>
                    </div>
                </div>
            </div>

            {/* Contribution Table and Controls */}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Rechercher par membre ou type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
                <div className="flex space-x-2">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="Tous">Tous les statuts</option>
                        <option value="Payé">Payé</option>
                        <option value="En attente">En attente</option>
                    </select>
                     <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="Tous">Tous les types</option>
                        <option value="Cotisation">Cotisation</option>
                        <option value="Don">Don</option>
                        <option value="Événement">Événement</option>
                    </select>
                    <button onClick={handleOpenModal} className="p-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" title="Ajouter une contribution">
                        <PlusIcon />
                    </button>
                    <button onClick={handleDownloadCSV} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Télécharger en CSV">
                        <DownloadIcon />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Membre</th>
                            <th scope="col" className="px-6 py-3">Montant</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Statut</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedContributions.map(c => (
                            <tr key={c.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {c.memberName}
                                </th>
                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(c.amount)}
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(c.date).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        c.type === 'Cotisation' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' :
                                        c.type === 'Don' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                        'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                    }`}>
                                        {c.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        c.status === 'Payé' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    }`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    {/* Placeholder for edit/delete actions */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-center">
                 <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Add Contribution Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ajouter une Contribution</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <CloseIcon />
                            </button>
                        </div>
                        <form onSubmit={handleAddContribution}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Membre */}
                                <div>
                                    <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Membre</label>
                                    <select 
                                        id="memberId" 
                                        value={selectedMemberId || ''} 
                                        onChange={e => setSelectedMemberId(Number(e.target.value))} 
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" 
                                        required
                                    >
                                        <option value="" disabled>Sélectionner un membre</option>
                                        {members.map(member => (
                                            <option key={member.id} value={member.id}>{member.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {/* Montant */}
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant (€)</label>
                                    <input 
                                        type="number" 
                                        id="amount" 
                                        value={amount} 
                                        onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" 
                                        required
                                        min="1"
                                    />
                                </div>
                                {/* Date */}
                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                                    <input 
                                        type="date" 
                                        id="date" 
                                        value={date} 
                                        onChange={e => setDate(e.target.value)} 
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" 
                                        required
                                    />
                                </div>
                                {/* Type */}
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                                    <select 
                                        id="type" 
                                        value={type} 
                                        onChange={e => setType(e.target.value as any)} 
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" 
                                        required
                                    >
                                        <option>Cotisation</option>
                                        <option>Don</option>
                                        <option>Événement</option>
                                    </select>
                                </div>
                                {/* Statut */}
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                                    <select 
                                        id="status" 
                                        value={status} 
                                        onChange={e => setStatus(e.target.value as any)} 
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" 
                                        required
                                    >
                                        <option>Payé</option>
                                        <option>En attente</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button type="button" onClick={handleCloseModal} disabled={isLoading} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50">Annuler</button>
                                <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                                    {isLoading ? 'Ajout...' : 'Ajouter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finances;
