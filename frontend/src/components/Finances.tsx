import React, { useState, useMemo, useEffect } from 'react';
import { Contribution, Member } from '../types';
import SearchIcon from './icons/SearchIcon';
import PlusIcon from './icons/PlusIcon';
import CloseIcon from './icons/CloseIcon';
import DownloadIcon from './icons/DownloadIcon';
import Pagination from './Pagination';
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
    const [isLoading, setIsLoading] = useState(false);
    
    const availableYears = useMemo(() => {
        const years = new Set(contributions.map(c => new Date(c.date).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [contributions]);

    const [selectedYear, setSelectedYear] = useState(availableYears[0] || new Date().getFullYear());

    // Form state
    const [memberId, setMemberId] = useState<number | ''>('');
    const [amount, setAmount] = useState<number | ''>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'Cotisation' | 'Don' | 'Événement'>('Cotisation');
    const [status, setStatus] = useState<'Payé' | 'En attente'>('Payé');

    const filteredContributions = useMemo(() => {
        return contributions.filter(c => {
            if (selectedMemberId !== null && c.memberId !== selectedMemberId) {
                return false;
            }
            const matchesSearch = c.memberName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'Tous' || c.status === statusFilter;
            const matchesType = typeFilter === 'Tous' || c.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [contributions, searchTerm, statusFilter, typeFilter, selectedMemberId]);

    const yearlyData = useMemo(() => {
        const contributionsInYear = contributions.filter(c => new Date(c.date).getFullYear() === selectedYear);

        const totalAmount = contributionsInYear.reduce((sum, c) => sum + c.amount, 0);
        
        const dataByType = contributionsInYear.reduce((acc, c) => {
            acc[c.type] = (acc[c.type] || 0) + c.amount;
            return acc;
        }, {} as Record<Contribution['type'], number>);

        const pieData = Object.entries(dataByType).map(([name, value]) => ({
            name,
            value,
        }));

        return { pieData, totalAmount };
    }, [contributions, selectedYear]);
    
    const memberData = useMemo(() => {
        if (selectedMemberId === null) return null;
        
        const member = members.find(m => m.id === selectedMemberId);
        const memberContributions = contributions.filter(c => c.memberId === selectedMemberId);
        
        if (!member) return null;

        if (memberContributions.length === 0) return { pieData: [], totalAmount: 0, memberName: member.name };

        const totalAmount = memberContributions.reduce((sum, c) => sum + c.amount, 0);
        
        const dataByType = memberContributions.reduce((acc, c) => {
            acc[c.type] = (acc[c.type] || 0) + c.amount;
            return acc;
        }, {} as Record<Contribution['type'], number>);

        const pieData = Object.entries(dataByType).map(([name, value]) => ({
            name,
            value,
        }));

        return { pieData, totalAmount, memberName: member.name };
    }, [contributions, selectedMemberId, members]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter, selectedMemberId]);

    const paginatedContributions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredContributions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredContributions, currentPage]);

    const totalPages = Math.ceil(filteredContributions.length / ITEMS_PER_PAGE);
    
    const tooltipBg = theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : '#FFFFFF';
    const legendColor = theme === 'dark' ? '#D1D5DB' : '#374151';
    const gridColor = theme === 'dark' ? '#4B5563' : '#E5E7EB';


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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!memberId || amount === '' || amount <= 0) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }
        
        setIsLoading(true);
        try {
            await onAddContribution({
                memberId: memberId as number,
                amount: amount as number,
                date,
                type,
                status,
            });
            handleCloseModal();
        } catch (error) {
            console.error("Échec de l'ajout de la contribution:", error);
        } finally {
            setIsLoading(false);
        }
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
        <div className="space-y-6">
             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <label htmlFor="member-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filtrer par membre
                </label>
                <select
                    id="member-select"
                    value={selectedMemberId ?? ''}
                    onChange={(e) => setSelectedMemberId(e.target.value ? Number(e.target.value) : null)}
                    className="mt-1 block w-full md:w-1/2 lg:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                >
                    <option value="">Vue d'overview (tous les membres)</option>
                    {members.sort((a,b) => a.name.localeCompare(b.name)).map(member => (
                        <option key={member.id} value={member.id}>
                            {member.name}
                        </option>
                    ))}
                </select>
            </div>
            {selectedMemberId !== null && memberData ? (
                // Member summary view
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Répartition pour {memberData.memberName}</h3>
                        {memberData.pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={memberData.pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={110}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {memberData.pieData.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: number) => `${value.toLocaleString('fr-FR')} CFA`}
                                        contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${gridColor}` }}
                                        labelStyle={{ color: legendColor }} 
                                    />
                                    <Legend wrapperStyle={{ color: legendColor }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                                Ce membre n'a aucune contribution enregistrée.
                            </div>
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Statistiques du Membre</h3>
                        <div className="text-center bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex-grow flex flex-col justify-center">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total des Contributions (Toutes Périodes)</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                {memberData.totalAmount.toLocaleString('fr-FR')} CFA
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                // Yearly statistics view
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                         <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Répartition par Type ({selectedYear})</h3>
                            <select 
                                id="year-select" 
                                aria-label="Sélectionner une année"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        {yearlyData.pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={yearlyData.pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={110}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {yearlyData.pieData.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: number) => `${value.toLocaleString('fr-FR')} CFA`}
                                        contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${gridColor}` }}
                                        labelStyle={{ color: legendColor }} 
                                    />
                                    <Legend wrapperStyle={{ color: legendColor }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                                Aucune donnée pour l'année {selectedYear}.
                            </div>
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Statistiques Annuelles</h3>
                        <div className="text-center bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex-grow flex flex-col justify-center">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total des Contributions pour {selectedYear}</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                {yearlyData.totalAmount.toLocaleString('fr-FR')} CFA
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Contributions Table */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Rechercher par nom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={!!selectedMemberId}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:opacity-75"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 md:space-x-4 w-full md:w-auto">
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            disabled={!!selectedMemberId}
                            className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 disabled:opacity-75"
                        >
                            <option value="Tous">Statut: Tous</option>
                            <option value="Payé">Payé</option>
                            <option value="En attente">En attente</option>
                        </select>
                        <select 
                            value={typeFilter} 
                            onChange={(e) => setTypeFilter(e.target.value)}
                            disabled={!!selectedMemberId}
                            className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 disabled:opacity-75"
                        >
                            <option value="Tous">Type: Tous</option>
                            <option value="Cotisation">Cotisation</option>
                            <option value="Don">Don</option>
                            <option value="Événement">Événement</option>
                        </select>
                        <button 
                            onClick={handleOpenModal} 
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Ajouter</span>
                        </button>
                        <button 
                            onClick={handleExportContributions} 
                            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Exporter en CSV"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="py-3 px-6">ID</th>
                                <th scope="col" className="py-3 px-6">Membre</th>
                                <th scope="col" className="py-3 px-6">Montant (CFA)</th>
                                <th scope="col" className="py-3 px-6">Date</th>
                                <th scope="col" className="py-3 px-6">Type</th>
                                <th scope="col" className="py-3 px-6">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedContributions.length > 0 ? (
                                paginatedContributions.map(c => (
                                    <tr key={c.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">{c.id}</td>
                                        <td className="py-4 px-6">{c.memberName}</td>
                                        <td className="py-4 px-6 font-semibold">
                                            {c.amount.toLocaleString('fr-FR')}
                                        </td>
                                        <td className="py-4 px-6">{new Date(c.date).toLocaleDateString('fr-FR')}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                c.type === 'Cotisation' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' :
                                                c.type === 'Don's' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                            }`}>
                                                {c.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                c.status === 'Payé' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        Aucune contribution trouvée correspondant aux filtres.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Add Contribution Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Ajouter une Nouvelle Contribution
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-4">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Membre <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="memberId"
                                        value={memberId}
                                        onChange={e => setMemberId(Number(e.target.value) || '')}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                        required
                                    >
                                        <option value="">Sélectionner un membre</option>
                                        {members.sort((a,b) => a.name.localeCompare(b.name)).map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Montant (CFA) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="amount"
                                            value={amount}
                                            onChange={e => setAmount(Number(e.target.value) || '')}
                                            min="1"
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="date"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="type"
                                            value={type}
                                            onChange={e => setType(e.target.value as 'Cotisation' | 'Don' | 'Événement')}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                            required
                                        >
                                            <option>Cotisation</option>
                                            <option>Don</option>
                                            <option>Événement</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Statut <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="status"
                                            value={status}
                                            onChange={e => setStatus(e.target.value as 'Payé' | 'En attente')}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                            required
                                        >
                                            <option>Payé</option>
                                            <option>En attente</option>
                                        </select>
                                    </div>
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
