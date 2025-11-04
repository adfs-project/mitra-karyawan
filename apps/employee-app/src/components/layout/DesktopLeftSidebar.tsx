import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@mk/shared';
import { HomeIcon, WalletIcon, BuildingStorefrontIcon, NewspaperIcon, HeartIcon, UserCircleIcon } from '@heroicons/react/24/solid';

const navItems = [
    { name: 'Home', path: '/home', icon: HomeIcon },
    { name: 'Wallet', path: '/wallet', icon: WalletIcon },
    { name: 'Market', path: '/market', icon: BuildingStorefrontIcon },
    { name: 'News', path: '/news', icon: NewspaperIcon },
    { name: 'Health', path: '/health', icon: HeartIcon },
    { name: 'Account', path: '/account', icon: UserCircleIcon },
];

const DesktopLeftSidebar: React.FC = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
            <div className="sticky top-20 space-y-6">
                {/* User Profile Card */}
                <div className="bg-surface p-4 rounded-lg border border-border-color">
                    <div className="flex items-center space-x-3">
                        <img src={user.profile.photoUrl} alt="Profile" className="w-12 h-12 rounded-full" />
                        <div>
                            <h2 className="font-bold text-text-primary truncate">{user.profile.name}</h2>
                            <p className="text-xs text-text-secondary truncate">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="bg-surface p-2 rounded-lg border border-border-color">
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 text-sm font-semibold rounded-md transition-colors ${
                                        isActive ? 'bg-primary text-black' : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
                                    }`
                                }
                            >
                                <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default DesktopLeftSidebar;
