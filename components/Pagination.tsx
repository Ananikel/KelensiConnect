
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null;
    }

    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const half = Math.floor(maxPagesToShow / 2);
    
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else if (currentPage <= half + 1) {
            for (let i = 1; i <= maxPagesToShow - 1; i++) pageNumbers.push(i);
            pageNumbers.push('...');
            pageNumbers.push(totalPages);
        } else if (currentPage >= totalPages - half) {
            pageNumbers.push(1);
            pageNumbers.push('...');
            for (let i = totalPages - (maxPagesToShow - 2); i <= totalPages; i++) pageNumbers.push(i);
        } else {
            pageNumbers.push(1);
            pageNumbers.push('...');
            for (let i = currentPage - (half - 1); i <= currentPage + (half - 1); i++) pageNumbers.push(i);
            pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();


    return (
        <div className="flex items-center justify-between mt-6 px-1">
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Précédent
            </button>
            
            <div className="hidden md:flex items-center space-x-2">
                {pageNumbers.map((num, index) => (
                    typeof num === 'number' ? (
                        <button
                            key={index}
                            onClick={() => onPageChange(num)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                currentPage === num 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {num}
                        </button>
                    ) : (
                        <span key={index} className="px-3 py-1.5 text-sm text-gray-500">
                            {num}
                        </span>
                    )
                ))}
            </div>

            <span className="md:hidden text-sm text-gray-700">
                Page {currentPage} sur {totalPages}
            </span>

            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Suivant
            </button>
        </div>
    );
};

export default Pagination;
