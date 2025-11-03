import React from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '@mk/shared';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    
    return (
        <div className="flex h-screen bg-background text-text-primary">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-surface p-4 flex justify-between items-center border-b border-border-color">
                    <h1 className="text-xl font-bold">Admin Dashboard</h1>
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

export default AdminLayout;
