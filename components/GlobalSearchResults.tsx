import React from 'react';
import { SearchResults, Member, AppEvent, Contribution, DocArticle } from '../types';
import MembersIcon from './icons/MembersIcon';
import EventsIcon from './icons/EventsIcon';
import FinancesIcon from './icons/FinancesIcon';
import DocumentationIcon from './icons/DocumentationIcon';

interface GlobalSearchResultsProps {
    results: SearchResults;
    onResultClick: (item: Member | AppEvent | Contribution | DocArticle, type: keyof SearchResults) => void;
}

const ResultItem: React.FC<{
    item: Member | AppEvent | Contribution | DocArticle;
    type: keyof SearchResults;
    icon: React.ReactNode;
    primaryText: string;
    secondaryText: string;
    onClick: () => void;
}> = ({ icon, primaryText, secondaryText, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 rounded-md"
    >
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full mr-3">
            <div className="w-5 h-5 text-gray-500 dark:text-gray-400">{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{primaryText}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{secondaryText}</p>
        </div>
    </button>
);

const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({ results, onResultClick }) => {
    const hasResults = Object.values(results).some(arr => arr.length > 0);

    const renderSection = (
        title: string,
        items: (Member | AppEvent | Contribution | DocArticle)[],
        type: keyof SearchResults,
        icon: React.ReactNode,
        primaryTextAccessor: (item: any) => string,
        secondaryTextAccessor: (item: any) => string,
    ) => {
        if (items.length === 0) return null;
        return (
            <div>
                <h3 className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{title}</h3>
                <ul>
                    {items.slice(0, 3).map((item, index) => (
                        <li key={`${type}-${(item as any).id}-${index}`}>
                            <ResultItem
                                item={item}
                                type={type}
                                icon={icon}
                                primaryText={primaryTextAccessor(item)}
                                secondaryText={secondaryTextAccessor(item)}
                                onClick={() => onResultClick(item, type)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="absolute top-full mt-2 w-80 lg:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 z-20 max-h-96 overflow-y-auto">
            {hasResults ? (
                <>
                    {renderSection('Membres', results.members, 'members', <MembersIcon />, item => item.name, item => item.email)}
                    {renderSection('Événements', results.events, 'events', <EventsIcon />, item => item.title, item => new Date(item.date).toLocaleDateString('fr-FR'))}
                    {renderSection('Finances', results.transactions, 'transactions', <FinancesIcon />, item => `Contribution: ${item.memberName}`, item => `${item.amount.toLocaleString('fr-FR')} CFA - ${new Date(item.date).toLocaleDateString('fr-FR')}`)}
                    {renderSection('Documentation', results.documentation, 'documentation', <DocumentationIcon />, item => item.title, item => item.category)}
                </>
            ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucun résultat trouvé.
                </div>
            )}
        </div>
    );
};

export default GlobalSearchResults;
