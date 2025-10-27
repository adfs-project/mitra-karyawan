import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCartIcon, BellIcon, LanguageIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Notification } from '../../types';

const NotificationPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
}> = ({ isOpen, onClose, notifications }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute top-16 right-4 w-80 bg-surface rounded-lg shadow-lg border border-border-color z-20 animate-fade-in-down">
            <div className="p-4 flex justify-between items-center border-b border-border-color">
                <h3 className="font-bold text-text-primary">Notifikasi</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-light">
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-border-color hover:bg-surface-light">
                            <p className="text-sm text-text-primary">{n.message}</p>
                            <p className="text-xs text-text-secondary mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <p className="p-4 text-center text-sm text-text-secondary">Tidak ada notifikasi baru.</p>
                )}
            </div>
        </div>
    );
};


const Header: React.FC = () => {
    const { user } = useAuth();
    const { notifications, cart, markNotificationsAsRead } = useData();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const userNotifications = notifications.filter(n => n.userId === user?.id);
    const unreadCount = userNotifications.filter(n => !n.read).length;
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const togglePanel = () => {
        if (!isPanelOpen && user) {
            markNotificationsAsRead(user.id);
        }
        setIsPanelOpen(!isPanelOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsPanelOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [panelRef]);

    return (
        <header className="bg-surface sticky top-0 z-10 p-4 flex justify-between items-center border-b border-border-color">
            <div className="text-xl font-bold text-primary">
                Mitra Karyawan
            </div>
            <div className="flex items-center space-x-4">
                <Link to="/cart" className="relative p-2 rounded-full hover:bg-surface-light">
                    <ShoppingCartIcon className="h-6 w-6 text-text-secondary" />
                    {cartItemCount > 0 && (
                         <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-primary text-black text-xs flex items-center justify-center font-bold">
                            {cartItemCount}
                        </span>
                    )}
                </Link>
                <div className="relative" ref={panelRef}>
                    <button onClick={togglePanel} className="relative p-2 rounded-full hover:bg-surface-light">
                        <BellIcon className="h-6 w-6 text-text-secondary" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-secondary text-black text-xs flex items-center justify-center font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <NotificationPanel 
                        isOpen={isPanelOpen} 
                        onClose={() => setIsPanelOpen(false)} 
                        notifications={userNotifications}
                    />
                </div>
                <button className="p-2 rounded-full hover:bg-surface-light">
                    <LanguageIcon className="h-6 w-6 text-text-secondary" />
                </button>
            </div>
        </header>
    );
};

export default Header;