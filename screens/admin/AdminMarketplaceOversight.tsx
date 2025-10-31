import React from 'react';
import { BuildingStorefrontIcon } from '@heroicons/react/24/solid';

const AdminMarketplaceOversight: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Marketplace Oversight</h1>
            
            <div className="flex flex-col items-center justify-center text-center p-16 bg-surface rounded-lg border border-border-color h-[60vh]">
                <BuildingStorefrontIcon className="h-24 w-24 text-border-color mb-6" />
                <h2 className="text-2xl font-bold text-primary">Fitur Marketplace Dinonaktifkan</h2>
                <p className="text-text-secondary max-w-md mt-4">
                    Manajemen Marketplace sedang dalam peninjauan dan tidak tersedia untuk saat ini di dasbor Admin.
                </p>
            </div>
        </div>
    );
};

export default AdminMarketplaceOversight;