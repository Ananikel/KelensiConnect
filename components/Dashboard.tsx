
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Contribution, Member } from '../types';
import UpcomingBirthdays from './UpcomingBirthdays';
import UsersIcon from './icons/UsersIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import CashIcon from './icons/CashIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';

interface DashboardProps {
    members: Member[];
    contributions: Contribution[];
    theme: 'light' | 'dark';
}

const useCountUp = (endValue: number, duration: number = 1500) => {
    const [count, setCount] = useState(0);
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);

    useEffect(() => {
        let frame = 0;
        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            // Ease-out quad easing function
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.round(endValue * easedProgress);
            
            setCount(currentCount);

            if (frame === totalFrames) {
                clearInterval(counter);
                setCount(endValue); // Ensure it ends on the exact number
            }
        }, frameRate);

        return () => clearInterval(counter);
    }, [endValue, duration, totalFrames]);

    return count;
};


const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: number;
    detail: string;
    colorClass: string;
    animationDelay?: string;
    formatter?: (value: number) => string;
}> = ({ icon, title, value, detail, colorClass, animationDelay = '0s', formatter = (v) => v.toString() }) => {
    const animatedValue = useCountUp(value);
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-between transform transition-transform duration-300 hover:-translate-y-1.5 opacity-0 animate-fade-in-up" style={{ animationDelay }}>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{formatter(animatedValue)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{detail}</p>
            </div>
            <div className={`p-4 rounded-full ${colorClass}`}>
                <div className="w-8 h-8 text-white">
                    {icon}
                </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ members, contributions, theme }) => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'Actif').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const contributionsThisMonth = contributions
        .filter(c => {
            const cDate = new Date(c.date);
            return cDate.getMonth() === currentMonth && cDate.getFullYear() === currentYear && c.status === 'Payé';
        })
        .reduce((sum, c) => sum + c.amount, 0);

    const contributionData = useMemo(() => {
        const dataMap = new Map<string, number>();
        const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return { month: d.toLocaleString('fr-FR', { month: 'short' }), year: d.getFullYear() };
        }).reverse();

        lastSixMonths.forEach(m => dataMap.set(`${m.month}`, 0));

        contributions.forEach(c => {
            const cDate = new Date(c.date);
            if(c.status === 'Payé' && (cDate > new Date(new Date().setMonth(new Date().getMonth() - 6)))) {
                const month = cDate.toLocaleString('fr-FR', { month: 'short' });
                if (dataMap.has(month)) {
                    dataMap.set(month, (dataMap.get(month) || 0) + c.amount);
                }
            }
        });
        
        return Array.from(dataMap, ([name, montant]) => ({ name, montant }));
    }, [contributions]);

    const recentContributions = useMemo(() => 
        [...contributions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [contributions]);

    const memberAvatars = useMemo(() => new Map(members.map(m => [m.id, m.avatar])), [members]);
    
    const tickColor = theme === 'dark' ? '#9CA3AF' : '#6B7281';
    const tooltipBg = theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    const legendColor = theme === 'dark' ? '#D1D5DB' : '#374151';
    const gridColor = theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : '#E5E7EB';

    return (
        <>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
            `}</style>
            <div className="space-y-8">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard 
                        icon={<UsersIcon />}
                        title="Total des Membres"
                        value={totalMembers}
                        detail={`${activeMembers} actifs`}
                        colorClass="bg-indigo-500"
                        animationDelay="0s"
                    />
                     <StatCard 
                        icon={<CheckCircleIcon />}
                        title="Membres Actifs"
                        value={activeMembers}
                        detail={`${((activeMembers/totalMembers) * 100 || 0).toFixed(0)}% de l'effectif`}
                        colorClass="bg-green-500"
                        animationDelay="150ms"
                    />
                     <StatCard 
                        icon={<CashIcon />}
                        title="Contributions"
                        value={contributionsThisMonth}
                        detail="Ce mois-ci (Payé)"
                        colorClass="bg-blue-500"
                        animationDelay="300ms"
                        formatter={(v) => `${v.toLocaleString('fr-FR')} CFA`}
                    />
                </div>

                {/* Monthly Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                    <div className="flex items-center mb-4">
                        <div className="text-indigo-600 dark:text-indigo-400 mr-3"><ChartBarIcon/></div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Contributions Mensuelles (6 derniers mois)</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={contributionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" tick={{ fill: tickColor }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }}/>
                            <YAxis tick={{ fill: tickColor }} axisLine={{ stroke: gridColor }} tickLine={{ stroke: gridColor }} />
                            <Tooltip 
                                formatter={(value: number) => `${value.toLocaleString('fr-FR')} CFA`} 
                                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${gridColor}`, borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ color: legendColor, fontWeight: 'bold' }}
                                cursor={{ fill: 'rgba(79, 70, 229, 0.1)'}}
                            />
                            <Legend wrapperStyle={{ color: legendColor, paddingTop: '10px' }}/>
                            <Bar dataKey="montant" fill="#4f46e5" name="Montant (CFA)" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                        <div className="flex items-center mb-4">
                           <div className="text-green-600 dark:text-green-400 mr-3"><ClipboardListIcon /></div>
                           <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Contributions Récentes</h3>
                        </div>
                        <div className="space-y-4">
                            {recentContributions.map((contrib: Contribution) => (
                                <div key={contrib.id} className="flex items-center justify-between p-2 rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div className="flex items-center">
                                        <img 
                                          src={memberAvatars.get(contrib.memberId) || `https://ui-avatars.com/api/?name=${contrib.memberName.replace(' ', '+')}`} 
                                          alt={contrib.memberName} 
                                          className="w-10 h-10 rounded-full object-cover mr-4"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{contrib.memberName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{contrib.type} - {new Date(contrib.date).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                         <p className="font-semibold text-green-600 dark:text-green-400">+{contrib.amount.toLocaleString('fr-FR')} CFA</p>
                                         <span className={`px-2 py-0.5 text-xs rounded-full ${contrib.status === 'Payé' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>{contrib.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '750ms' }}>
                        <UpcomingBirthdays members={members} />
                     </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
