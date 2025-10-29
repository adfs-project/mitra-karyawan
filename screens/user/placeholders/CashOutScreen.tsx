import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, BanknotesIcon } from '@heroicons/react/24/solid';

const CashOutScreen = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Tarik Tunai</h1>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border-color text-center">
                 <BanknotesIcon className="h-16 w-16 text-secondary mx-auto mb-4"/>
                <p className="text-text-secondary mb-4">Tarik tunai saldo dompet Anda di ribuan gerai mitra terdekat. Fitur ini sedang dalam pengembangan.</p>
                <div className="space-y-4 text-left">
                     <div>
                        <label className="text-sm font-bold text-text-secondary">Jumlah Tarik Tunai</label>
                        <input type="number" disabled className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color cursor-not-allowed" placeholder="min. Rp 50.000" />
                    </div>
                     <button disabled className="w-full p-3 bg-gray-600 font-bold rounded-lg cursor-not-allowed">
                        Dapatkan Kode Penarikan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CashOutScreen;
