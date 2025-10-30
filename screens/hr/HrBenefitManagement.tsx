import React from 'react';
import { GiftIcon } from '@heroicons/react/24/solid';

const HrBenefitManagement: React.FC = () => {
    return (
        <div className="p-4 space-y-6 text-center">
            <GiftIcon className="h-24 w-24 text-border-color mx-auto" />
            <h1 className="text-3xl font-bold text-primary">Manajemen Benefit & Klaim</h1>
            <p className="text-text-secondary max-w-md mx-auto">
                Fitur ini sedang dalam peninjauan dan tidak tersedia saat ini.
            </p>
        </div>
    );
};

export default HrBenefitManagement;
