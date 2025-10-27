import React from 'react';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/solid';

const AdminHomePageOrchestrator: React.FC = () => {
    return (
        <div className="space-y-8 flex flex-col items-center justify-center text-center h-full">
            <WrenchScrewdriverIcon className="h-24 w-24 text-border-color" />
            <h1 className="text-3xl font-bold text-primary">Dalam Pengembangan</h1>
            <p className="text-text-secondary max-w-md">
                Maaf, menu ini masih dalam pengembangan.
            </p>
        </div>
    );
};

export default AdminHomePageOrchestrator;