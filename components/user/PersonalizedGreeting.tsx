import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
// FIX: Replaced useCore with useApp as DataContext is deprecated.
import { useApp } from '../../contexts/AppContext';

const PersonalizedGreeting: React.FC = () => {
    const { user } = useAuth();
    const { notifications } = useApp();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Selamat Pagi";
        if (hour < 15) return "Selamat Siang";
        if (hour < 19) return "Selamat Sore";
        return "Selamat Malam";
    };

    const unreadCount = notifications.filter(n => n.userId === user?.id && !n.read).length;

    const getSmartSummary = () => {
        if (unreadCount > 0) {
            return `Anda punya ${unreadCount} notifikasi baru.`;
        }
        return "Semoga harimu menyenangkan!";
    };

    if (!user) return null;

    return (
        <div>
            <h1 className="text-2xl font-bold text-text-primary">{getGreeting()}, {user.profile.name.split(' ')[0]}!</h1>
            <p className="text-text-secondary">{getSmartSummary()}</p>
        </div>
    );
};

export default PersonalizedGreeting;