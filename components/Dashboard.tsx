import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Contribution, Member } from '../types';
import UpcomingBirthdays from './UpcomingBirthdays';

interface DashboardProps {
    members: Member[];
    contributions: Contribution[];
    theme: 'light' | 'dark';
}

const Dashboard: React.FC<DashboardProps> = ({ members, contributions, theme }) => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'Actif').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const contributionsThisMonth = contributions
        .filter(c => {
            const cDate = new Date(c.date);
            return cDate.getMonth() === currentMonth && cDate.getFullYear() === currentYear;
        })
        .reduce((sum, c) => sum + c.amount, 0);

    const contributionData = contributions.reduce((acc, curr) => {
        const month = new Date(curr.date).toLocaleString('fr-FR', { month: 'short' });
        const existingMonth = acc.find(item => item.name === month);
        if (existingMonth) {
            existingMonth.montant += curr.amount;
        } else {
            acc.push({ name: month, montant: curr.amount });
        }
        return acc;
    }, [] as {name: string; montant: number}[]).reverse();
    
    const recentContributions = [...contributions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    
    const tickColor = theme === 'dark' ? '#9CA3AF' : '#6B7281';
    const tooltipBg = theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : '#FFFFFF';
    const legendColor = theme === 'dark' ? '#D1D5DB' : '#374151';
    const gridColor = theme === 'dark' ? '#4B5563' : '#E5E7EB';

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total des Membres</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{totalMembers}</p>
                    </div>
                     <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Membres Actifs</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{activeMembers}</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contributions (Mois en cours)</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{contributionsThisMonth.toLocaleString('fr-FR')} CFA</p>
                    </div>
                     <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                         <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                </div>
            </div>

            {/* Monthly Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Contributions Mensuelles</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={contributionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="name" tick={{ fill: tickColor }} />
                        <YAxis tick={{ fill: tickColor }} />
                        <Tooltip 
                            formatter={(value: number) => `${value.toLocaleString('fr-FR')} CFA`} 
                            contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${gridColor}` }}
                            labelStyle={{ color: legendColor }}
                        />
                        <Legend wrapperStyle={{ color: legendColor }}/>
                        <Bar dataKey="montant" fill="#4f46e5" name="Montant (CFA)"/>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Contributions Récentes</h3>
                    <div className="space-y-4">
                        {recentContributions.map((contrib: Contribution) => (
                            <div key={contrib.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{contrib.memberName.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-gray-200">{contrib.memberName}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{contrib.type} - {new Date(contrib.date).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <p className="font-semibold text-green-600 dark:text-green-400">+{contrib.amount.toLocaleString('fr-FR')} CFA</p>
                                     <span className={`px-2 py-1 text-xs rounded-full ${contrib.status === 'Payé' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>{contrib.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <UpcomingBirthdays members={members} />
            </div>
        </div>
    );
};

export default Dashboard;