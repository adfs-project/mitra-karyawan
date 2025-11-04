
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    ChartBarIcon, 
    UserPlusIcon, 
    CalendarDaysIcon, 
    BanknotesIcon, 
    GiftIcon, 
    SparklesIcon, 
    ClipboardDocumentListIcon, 
    HeartIcon, 
    CreditCardIcon, 
    ClipboardDocumentCheckIcon 
} from '@heroicons/react/24/solid';

const navigation = [
    { name: 'Dashboard', href: '/hr/dashboard', icon: ChartBarIcon },
    { name: 'Onboarding', href: '/hr/onboarding', icon: UserPlusIcon },
    { name: 'Leave Management', href: '/hr/leave', icon: CalendarDaysIcon },
    { name: 'Attendance', href: '/hr/attendance', icon: ClipboardDocumentListIcon },
    { name: 'Opex Verification', href: '/hr/opex', icon: CreditCardIcon },
    { name: 'Benefit & Claims', href: '/hr/benefits', icon: GiftIcon },
    { name: 'Wellness', href: '/hr/wellness', icon: HeartIcon },
    { name: 'Performance', href: '/hr/performance', icon: ClipboardDocumentCheckIcon },
    { name: 'Payroll', href: '/hr/payroll', icon: BanknotesIcon },
    { name: 'PayLater Approval', href: '/hr/pay-later', icon: CreditCardIcon },
    { name: 'AI Co-pilot', href: '/hr/copilot', icon: SparklesIcon },
];

const HrSidebar: React.FC = () => {
    return (
        <div className="w-64 bg-surface flex flex-col border-r border-border-color">
            <div className="flex items-center justify-center h-16 border-b border-border-color">
                <h1 className="text-2xl font-bold text-primary">HR PORTAL</h1>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) =>
                    <NavLink
                        key={item.name}
                        to={item.href}
                        end={item.href === '/hr/dashboard'} // Ensure only dashboard is exact match
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive ? 'bg-primary text-black' : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
                            }`
                        }
                    >
                        <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                        {item.name}
                    </NavLink>
                )}
            </nav>
        </div>
    );
};

export default HrSidebar;
