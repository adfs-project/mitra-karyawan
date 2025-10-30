import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChartBarIcon, BanknotesIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';

const navigation = [
    { name: 'Opex Approval', href: '/finance/dashboard', icon: ChartBarIcon },
    { name: 'Command Center', href: '/finance/command-center', icon: BanknotesIcon },
    { name: 'Payroll Report', href: '/finance/payroll-report', icon: BanknotesIcon },
];

const FinanceSidebar: React.FC = () => {
    return (
        <div className="w-64 bg-surface flex flex-col border-r border-border-color">
            <div className="flex items-center justify-center h-16 border-b border-border-color">
                <h1 className="text-2xl font-bold text-primary">FINANCE</h1>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
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
                ))}
            </nav>
        </div>
    );
};

export default FinanceSidebar;