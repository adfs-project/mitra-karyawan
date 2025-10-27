import React from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, UserPlusIcon, CalendarDaysIcon, BanknotesIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
    { name: 'HR Dashboard', href: '/hr/dashboard', icon: ChartBarIcon, description: 'View analytics and key metrics for your branch.' },
    { name: 'Onboarding', href: '/hr/onboarding', icon: UserPlusIcon, description: 'Manage new hire onboarding and offboarding processes.' },
    { name: 'Leave Management', href: '/hr/leave', icon: CalendarDaysIcon, description: 'Approve or reject leave requests from employees.' },
    { name: 'Payroll', href: '/hr/payroll', icon: BanknotesIcon, description: 'Simulate and manage employee payroll.' },
];

const HrPortalScreen: React.FC = () => {
    const { user } = useAuth();
    
    return (
        <div className="p-4 space-y-6">
            <div className="text-center">
                 <h1 className="text-3xl font-bold text-primary">HR Portal</h1>
                 <p className="text-text-secondary mt-1">Your gateway to Human Resources tools for the {user?.profile.branch} branch.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        to={item.href}
                        className="bg-surface p-6 rounded-lg border border-border-color hover:border-primary hover:bg-surface-light transition-all"
                    >
                        <div className="flex items-center">
                             <item.icon className="h-8 w-8 text-primary mr-4" />
                             <div>
                                <h2 className="text-lg font-bold text-text-primary">{item.name}</h2>
                                <p className="text-sm text-text-secondary">{item.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="text-center mt-4">
                 <Link to="/account" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to My Account
                </Link>
            </div>
        </div>
    );
};

export default HrPortalScreen;