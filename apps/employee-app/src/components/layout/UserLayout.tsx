import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex flex-col h-screen bg-background text-text-primary">
            <Header />
            <main className="flex-grow overflow-y-auto pb-16 desktop:pb-0 desktop:px-8 xl:px-12">
                {children}
            </main>
            {/* The BottomNav is now wrapped in a div that hides it on desktop screens */}
            <div className="desktop:hidden">
                <BottomNav />
            </div>
        </div>
    );
};

export default UserLayout;
