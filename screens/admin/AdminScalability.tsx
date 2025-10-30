import React from 'react';
import { CloudIcon } from '@heroicons/react/24/solid';

const AdminScalability: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Infrastructure Orchestration Dashboard</h1>
            
            <div className="flex flex-col items-center justify-center text-center p-16 bg-surface rounded-lg border border-border-color h-[60vh]">
                <CloudIcon className="h-24 w-24 text-border-color mb-6" />
                <h2 className="text-2xl font-bold text-primary">Segera Hadir</h2>
                <p className="text-text-secondary max-w-md mt-4">
                    Fitur orkestrasi infrastruktur sedang dalam pengembangan. Anda akan dapat mengelola dan memantau layanan skalabilitas seperti Load Balancer, CDN, dan database replicas dari sini.
                </p>
            </div>
        </div>
    );
};

export default AdminScalability;
