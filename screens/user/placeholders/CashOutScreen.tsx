import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useApp } from '../../../contexts/AppContext';

const CashOutScreen: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useApp();

    useEffect(() => {
        const timer: number = window.setTimeout(() => {
            showToast('Fitur Tarik Tunai segera hadir!', 'info');
        }, 500);
        return () => clearTimeout(timer);
    }, [showToast]);

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Tarik Tunai</h1>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <p className="text-text-secondary mb-4">Fitur ini sedang dalam pengembangan. Anda akan dapat menarik saldo dompet Anda di ATM atau gerai retail terdekat.</p>
                <div className="space-y-4 opacity-50">
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Jumlah Penarikan</label>
                        <input type="number" disabled className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color cursor-not-allowed" placeholder="e.g., 100000" />
                    </div>
                     <button disabled className="w-full p-3 bg-gray-600 font-bold rounded-lg cursor-not-allowed">
                        Buat Kode Penarikan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CashOutScreen;