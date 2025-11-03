import React from 'react';
import { useAuth, useData } from '@mk/shared';

const PersonalizedGreeting: React.FC = () => {
    const { user } = useAuth();
    const { notifications } = useData();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Selamat Pagi";
        if (hour < 15) return "Selamat Siang";
        if (hour < 19) return "Selamat Sore";
        return "Selamat Malam";
    };

    if (!user?.profile?.name) return null;

    const unreadCount = notifications.filter(n => n.userId === user.id && !n.read).length;

    const getSmartSummary = () => {
        if (unreadCount > 0) {
            return `Anda punya ${unreadCount} notifikasi baru.`;
        }
        return "Semoga harimu menyenangkan!";
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-text-primary">{getGreeting()}, {user.profile.name.split(' ')[0]}!</h1>
            <p className="text-text-secondary">{getSmartSummary()}</p>
        </div>
    );
};

export default PersonalizedGreeting;