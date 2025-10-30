import React from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';

const AdminMarketplaceOversight: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Marketplace Oversight</h1>
            
            <div className="flex flex-col items-center justify-center text-center p-16 bg-surface rounded-lg border border-border-color h-[60vh]">
                <ShoppingCartIcon className="h-24 w-24 text-border-color mb-6" />
                <h2 className="text-2xl font-bold text-primary">Segera Hadir</h2>
                <p className="text-text-secondary max-w-md mt-4">
                    Fitur manajemen marketplace sedang dalam pengembangan. Anda akan dapat mengelola produk, memantau penjualan, dan menangani sengketa dari sini.
                </p>
            </div>
        </div>
    );
};

export default AdminMarketplaceOversight;