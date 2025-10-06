import React from 'react';
import { Notification } from '../types';
import NotificationToast from './NotificationToast';

interface NotificationCenterProps {
    notifications: Notification[];
    removeNotification: (id: number) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, removeNotification }) => {
    return (
        <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
            <div className="space-y-3">
                {notifications.map(notification => (
                    <NotificationToast 
                        key={notification.id}
                        notification={notification}
                        onDismiss={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationCenter;