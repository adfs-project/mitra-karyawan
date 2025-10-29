import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

const DailyNeedsScreen = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Belanja Harian</h1>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <div className="text-center py-16">
                    <ShoppingCartIcon className="h-20 w-20 mx-auto text-text-secondary opacity-50"/>
                    <h2 className="mt-4 text-xl font-semibold text-text-primary">Terintegrasi dengan Toko Terdekat</h2>
                    <p className="text-text-secondary mt-2 max-w-sm mx-auto">Fitur ini akan memungkinkan Anda berbelanja kebutuhan harian dari toko kelontong dan mitra di sekitar Anda, langsung dari aplikasi.</p>
                </div>
            </div>
        </div>
    );
};

export default DailyNeedsScreen;
