import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChartBarIcon, CurrencyDollarIcon, BuildingStorefrontIcon, UsersIcon, HeartIcon, Cog6ToothIcon, WrenchScrewdriverIcon, ArchiveBoxIcon, HomeModernIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
    { name: 'Home Orchestrator', href: '/admin/home-orchestrator', icon: HomeModernIcon },
    { name: 'Assistant Hub', href: '/admin/assistant-hub', icon: ChatBubbleLeftRightIcon },
    { name: 'Financial Hub', href: '/admin/financials', icon: CurrencyDollarIcon },
    { name: 'Marketplace', href: '/admin/marketplace', icon: BuildingStorefrontIcon },
    { name: 'User Intelligence', href: '/admin/users', icon: UsersIcon },
    { name: 'Health Providers', href: '/admin/health', icon: HeartIcon },
    { name: 'Info & News', href: '/admin/news', icon: ArchiveBoxIcon },
    { name: 'Monetization', href: '/admin/monetization', icon: WrenchScrewdriverIcon },
    { name: 'Tax Management', href: '/admin/tax', icon: CurrencyDollarIcon },
    { name: 'System Management', children: [
        { name: 'API Integration', href: '/admin/system/api' },
        { name: 'Scalability', href: '/admin/system/scalability' },
    ], icon: Cog6ToothIcon },
];

const AdminSidebar: React.FC = () => {
    return (
        <div className="w-64 bg-surface flex flex-col border-r border-border-color">
            <div className="flex items-center justify-center h-16 border-b border-border-color">
                <h1 className="text-2xl font-bold text-primary">ADMIN</h1>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) =>
                    !item.children ? (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    isActive ? 'bg-primary text-black' : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
                                }`
                            }
                        >
                            <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                            {item.name}
                        </NavLink>
                    ) : (
                        <div key={item.name}>
                             <div className="flex items-center px-4 py-2 text-sm font-medium text-text-secondary">
                                <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                                {item.name}
                            </div>
                            <div className="space-y-1 ml-4">
                            {item.children.map((child) => (
                                <NavLink
                                    key={child.name}
                                    to={child.href}
                                    className={({ isActive }) =>
                                        `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                            isActive ? 'bg-primary/80 text-black' : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
                                        }`
                                    }
                                >
                                    {child.name}
                                </NavLink>
                            ))}
                            </div>
                        </div>
                    )
                )}
            </nav>
        </div>
    );
};

export default AdminSidebar;