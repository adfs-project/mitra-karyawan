import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, BoltIcon, BuildingLibraryIcon, WifiIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { useData } from '../../../contexts/DataContext';

const billers = [
    { id: 'ppob-listrik', name: 'Listrik PLN', icon: BoltIcon },
    { id: 'ppob-pdam', name: 'Air PDAM', icon: BuildingLibraryIcon },
    { id: 'ppob-internet', name: 'Internet & TV Kabel', icon: WifiIcon },
    { id: 'ppob-bpjs', name: 'BPJS Kesehatan', icon: ShieldCheckIcon },
];

const PPOBScreen = () => {
    const navigate = useNavigate();
    const { serviceLinkage, apiIntegrations, showToast } = useData();

    const handlePay = (featureId: string) => {
        const providerId = serviceLinkage[featureId];
        const provider = apiIntegrations.find(api => api.id === providerId);
        if (provider) {
            showToast(`Mencoba membayar melalui ${provider.name}... (Simulasi)`, 'info');
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">PPOB & Tagihan</h1>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <p className="text-text-secondary mb-4">Bayar semua tagihan bulanan Anda dengan mudah di satu tempat.</p>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Nomor Pelanggan</label>
                        <input type="text" className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color" placeholder="Contoh: 1234567890" />
                    </div>
                    {billers.map(biller => {
                        const isConnected = !!serviceLinkage[biller.id];
                        return (
                            <div key={biller.id} className={`flex items-center justify-between p-3 bg-surface-light rounded-lg ${!isConnected ? 'opacity-60' : ''}`}>
                                <div className="flex items-center">
                                    <biller.icon className="h-6 w-6 text-secondary mr-3" />
                                    <span className="font-semibold text-text-primary">{biller.name}</span>
                                </div>
                                <button 
                                    onClick={() => isConnected && handlePay(biller.id)}
                                    disabled={!isConnected} 
                                    className={`px-4 py-1 text-sm font-bold rounded-full ${isConnected ? 'bg-primary text-black' : 'bg-gray-600 cursor-not-allowed'}`}
                                >
                                    Bayar
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PPOBScreen;