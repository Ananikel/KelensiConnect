import React, { useState, useMemo, useEffect } from 'react';
import { Contribution, Member } from '../types';
import SearchIcon from '../icons/SearchIcon'; // <-- CORRIGÉ
import PlusIcon from '../icons/PlusIcon'; // <-- CORRIGÉ
import CloseIcon from '../icons/CloseIcon'; // <-- CORRIGÉ
import DownloadIcon from '../icons/DownloadIcon'; // <-- CORRIGÉ
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
                memberId: memberId as number, // Assurez-vous que le type est correct
                amount: amount as number, // Assurez-vous que le type est correct
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
                    <option value="">Vue d'ensemble (tous les membres)</option>
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
                <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-4 md:space-y-0">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Détail des Contributions ({selectedMemberId !== null ? memberData?.memberName : 'Tous'})</h2>
                    <div className="flex space-x-2">
                        <button 
                            onClick={handleOpenModal} 
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-700 transition-colors flex items-center"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" /> Ajouter Contribution
                        </button>
                        <button 
                            onClick={handleExportContributions} 
                            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
                        >
                            <DownloadIcon className="w-5 h-5 mr-2" /> Exporter
                        </button>
                    </div>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                    <div className="relative flex-grow">
                         <input
                            type="text"
                            placeholder="Rechercher par membre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                   
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                    >
                        <option>Tous</option>
                        {Object.keys(COLORS).map(type => <option key={type}>{type}</option>)}
                    </select>
                     <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                    >
                        <option>Tous</option>
                        <option>Payé</option>
                        <option>En attente</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Membre
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Montant (CFA)
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Statut
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedContributions.length > 0 ? (
                                paginatedContributions.map((c) => (
                                    <tr key={c.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {c.memberName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {c.amount.toLocaleString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}
                                                style={{ 
                                                    backgroundColor: `${COLORS[c.type as keyof typeof COLORS]}1A`, // 10% opacity
                                                    color: COLORS[c.type as keyof typeof COLORS] 
                                                }}
                                            >
                                                {c.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {new Date(c.date).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                c.status === 'Payé' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Aucune contribution trouvée.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="mt-4">
                         <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                         />
                    </div>
                )}
            </div>
            
            {/* Add Contribution Modal */}
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ajouter une Nouvelle Contribution</h3>
                            <button onClick={handleCloseModal} disabled={isLoading} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Membre</label>
                                    <select
                                        id="memberId"
                                        value={memberId}
                                        onChange={e => setMemberId(Number(e.target.value))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                        required
                                    >
                                        <option value="">Sélectionner un membre</option>
                                        {members.sort((a,b) => a.name.localeCompare(b.name)).map(member => (
                                            <option key={member.id} value={member.id}>{member.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Montant (CFA)</label>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={amount}
                                        onChange={e => setAmount(Number(e.target.value))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                        min="1"
                                        required
                                    />
                                </div>
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
                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de Contribution</label>
                                    <select
                                        id="type"
                                        value={type}
                                        onChange={e => setType(e.target.value as any)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                                        required
                                    >
                                        {Object.keys(COLORS).map(type => <option key={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
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
                                <button type="button" onClick={handleCloseModal} disabled={isLoading} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500">Annuler</button>
                                <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 hover:bg-indigo-700">
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
