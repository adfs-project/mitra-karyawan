import React from 'react';
import { useAuth } from '@mk/shared';
import { NavLink } from 'react-router-dom';
import { HomeIcon, WalletIcon, BuildingStorefrontIcon, NewspaperIcon, HeartIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, WalletIcon as WalletSolid, BuildingStorefrontIcon as MarketSolid, NewspaperIcon as NewsSolid, HeartIcon as HealthSolid, UserCircleIcon as AccountSolid } from '@heroicons/react/24/solid';


const UserProfileSidebar: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;
    return (
        <div className="p-4 bg-surface rounded-lg text-center border border-border-color">
            <img src={user.profile.photoUrl} alt="Profile" className="w-20 h-20 rounded-full mx-auto border-2 border-primary"/>
            <h3 className="mt-2 font-bold text-lg truncate">{user.profile.name}</h3>
            <p className="text-xs text-text-secondary truncate">{user.email}</p>
        </div>
    );
};

const NavigationSidebar: React.FC = () => {
    const navItems = [
        { name: 'Home', path: '/home', icon: HomeIcon, solidIcon: HomeSolid },
        { name: 'Wallet', path: '/wallet', icon: WalletIcon, solidIcon: WalletSolid },
        { name: 'Market', path: '/market', icon: BuildingStorefrontIcon, solidIcon: MarketSolid },
        { name: 'News', path: '/news', icon: NewspaperIcon, solidIcon: NewsSolid },
        { name: 'Health', path: '/health', icon: HeartIcon, solidIcon: HealthSolid },
        { name: 'Account', path: '/account', icon: UserCircleIcon, solidIcon: AccountSolid },
    ];
    return (
         <div className="p-4 bg-surface rounded-lg border border-border-color">
            <h3 className="font-bold text-text-secondary text-sm mb-2 px-2">Menu</h3>
            <nav className="space-y-1">
                {navItems.map(item => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive ? 'bg-primary/20 text-primary font-bold' : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
                            }`
                        }
                    >
                        {({ isActive }) => {
                           const Icon = isActive ? item.solidIcon : item.icon;
                           return <Icon className="h-5 w-5 mr-3" />
                        }}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};


const DesktopLeftSidebar: React.FC = () => {
    return (
        <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-6">
                <UserProfileSidebar />
                <NavigationSidebar />
            </div>
        </aside>
    );
};

export default DesktopLeftSidebar;
