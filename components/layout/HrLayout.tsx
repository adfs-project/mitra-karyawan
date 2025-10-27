
import React from 'react';
import HrSidebar from './HrSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const HrLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    
    return (
        <div className="flex h-screen bg-background text-text-primary">
            <HrSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-surface p-4 flex justify-between items-center border-b border-border-color">
                    <div className="flex items-center">
                         <Link to="/hr-portal" className="p-2 rounded-full hover:bg-surface-light mr-2">
                            <ArrowLeftIcon className="h-5 w-5"/>
                         </Link>
                        <h1 className="text-xl font-bold">HR Portal ({user?.profile.branch})</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span>Welcome, {user?.profile.name}</span>
                        <button onClick={logout} className="px-4 py-2 rounded bg-secondary text-black font-bold">Logout</button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default HrLayout;
