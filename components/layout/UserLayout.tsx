import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex flex-col h-screen bg-background text-text-primary">
            <Header />
            <main className="flex-grow overflow-y-auto pb-16">
                {children}
            </main>
            <BottomNav />
        </div>
    );
};

export default UserLayout;