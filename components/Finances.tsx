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
    setContributions: React.Dispatch<React.SetStateAction<Contribution[]>>;
}

const ITEMS_PER_PAGE = 10;
const COLORS = {
    'Cotisation': '#4f46e5', // Indigo
    'Don': '#10b981',       // Green
    'Événement': '#f59e0b', // Amber
};

const Finances: React.FC<FinancesProps> = ({ members, contributions, setContributions }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [typeFilter, setTypeFilter] = useState('Tous');
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    
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
            const matchesSearch = c.memberName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'Tous' || c.status === statusFilter;
            const matchesType = typeFilter === 'Tous' || c.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [contributions, searchTerm, statusFilter, typeFilter]);

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
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter]);

    const paginatedContributions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredContributions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredContributions, currentPage]);

    const totalPages = Math.ceil(filteredContributions.length / ITEMS_PER_PAGE);

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
        <div className="space-y-6">
            {/* Year Statistics and Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                     <h3 className="text-lg font-semibold text-gray-700 mb-4">Répartition par Type de Contribution ({selectedYear})</h3>
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
                                <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} CFA`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                     ) : (
                         <div className="flex items-center justify-center h-[300px] text-gray-500">
                            Aucune donnée pour l'année {selectedYear}.
                         </div>
                     )}
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Statistiques Annuelles</h3>
                        <div className="mb-4">
                            <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">
                                Sélectionner une année
                            </label>
                            <select 
                                id="year-select" 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="text-center bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500">Total des Contributions pour {selectedYear}</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">
                            {yearlyData.totalAmount.toLocaleString('fr-FR')} CFA
                        </p>
                    </div>
                </div>
            </div>

            {/* Contributions Table */}
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
                            {paginatedContributions.map((c: Contribution) => (
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
                 <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
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
        </div>
    );
};

export default Finances;