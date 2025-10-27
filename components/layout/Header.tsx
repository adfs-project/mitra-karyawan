

import React from 'react';
import { ShoppingCartIcon, BellIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    const { user } = useAuth();
    const { notifications, cart } = useData();
    const unreadCount = notifications.filter(n => n.userId === user?.id && !n.read).length;
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
                <button className="relative p-2 rounded-full hover:bg-surface-light">
                    <BellIcon className="h-6 w-6 text-text-secondary" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-secondary text-black text-xs flex items-center justify-center font-bold">
                            {unreadCount}
                        </span>
                    )}
                </button>
                <button className="p-2 rounded-full hover:bg-surface-light">
                    <LanguageIcon className="h-6 w-6 text-text-secondary" />
                </button>
            </div>
        </header>
    );
};

export default Header;