import React, { useEffect } from 'react';
import { Notification } from '../types';
import CloseIcon from './icons/CloseIcon';

interface NotificationToastProps {
    notification: Notification;
    onDismiss: () => void;
}

const icons = {
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    warning: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    error: (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

const styleMap = {
    info: {
        border: 'border-blue-500',
        icon: 'text-blue-500 dark:text-blue-400',
    },
    warning: {
        border: 'border-yellow-500',
        icon: 'text-yellow-500 dark:text-yellow-400',
    },
    success: {
        border: 'border-green-500',
        icon: 'text-green-500 dark:text-green-400',
    },
    error: {
        border: 'border-red-500',
        icon: 'text-red-500 dark:text-red-400',
    }
};


const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 7000); // Auto-dismiss after 7 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [onDismiss]);

    const styles = styleMap[notification.type];
    const icon = icons[notification.type];

    return (
        <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex items-start animate-fade-in-right border-l-4 ${styles.border}`}>
            <div className={`${styles.icon} mr-4 flex-shrink-0`}>
                {icon}
            </div>
            <div className="flex-grow">
                <h4 className="font-bold text-gray-800 dark:text-gray-200">{notification.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
            </div>
            <button onClick={onDismiss} className="ml-4 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800" aria-label="Fermer la notification">
                <CloseIcon />
            </button>
             <style>{`
                @keyframes fade-in-right {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-fade-in-right {
                    animation: fade-in-right 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default NotificationToast;