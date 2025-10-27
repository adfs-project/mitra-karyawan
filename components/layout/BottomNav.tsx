
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, WalletIcon, BuildingStorefrontIcon, NewspaperIcon, HeartIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const navItems = [
    { name: 'Home', path: '/home', icon: HomeIcon },
    { name: 'Wallet', path: '/wallet', icon: WalletIcon },
    { name: 'Market', path: '/market', icon: BuildingStorefrontIcon },
    { name: 'Info', path: '/news', icon: NewspaperIcon },
    { name: 'Health', path: '/health', icon: HeartIcon },
    { name: 'Account', path: '/account', icon: UserCircleIcon },
];

const BottomNav: React.FC = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border-color z-10">
            <div className="flex justify-around max-w-lg mx-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center flex-grow py-2 text-xs transition-colors duration-200 ${
                                isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'
                            }`
                        }
                    >
                        <item.icon className="h-6 w-6 mb-1" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
