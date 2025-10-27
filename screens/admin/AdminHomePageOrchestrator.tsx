import React from 'react';
import { ArchiveBoxXMarkIcon } from '@heroicons/react/24/solid';

const AdminHomePageOrchestrator: React.FC = () => {
    return (
        <div className="space-y-8 flex flex-col items-center justify-center text-center h-full">
            <ArchiveBoxXMarkIcon className="h-24 w-24 text-border-color" />
            <h1 className="text-3xl font-bold text-primary">Feature Deprecated</h1>
            <p className="text-text-secondary max-w-md">
                The "Home Page Orchestrator" has been replaced by the more advanced "Personalization Engine". 
                Please use the "Personalization" menu in the sidebar to manage dynamic home page content.
            </p>
        </div>
    );
};

export default AdminHomePageOrchestrator;