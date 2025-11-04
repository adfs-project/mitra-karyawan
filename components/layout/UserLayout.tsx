import React from 'react';
import Header from './Header';
import DesktopLeftSidebar from './DesktopLeftSidebar';

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex flex-col h-screen bg-background text-text-primary">
            <Header />
            <div className="flex-grow overflow-hidden grid grid-cols-12">
                <DesktopLeftSidebar />
                <main className="col-span-9 xl:col-span-10 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserLayout;