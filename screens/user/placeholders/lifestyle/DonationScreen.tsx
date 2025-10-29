import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useData } from '../../../../contexts/DataContext';

const DonationScreen = () => {
    const navigate = useNavigate();
    const { serviceLinkage, apiIntegrations, showToast } = useData();

    const isConnected = !!serviceLinkage['lifestyle-donation'];
    const provider = apiIntegrations.find(api => api.id === serviceLinkage['lifestyle-donation']);
    
    const handleDonate = () => {
        if (provider) {
            showToast(`Memproses donasi melalui ${provider.name}... (Simulasi)`, 'info');
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Donasi</h1>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <p className="text-text-secondary mb-4">
                    {isConnected 
                        ? `Salurkan bantuan Anda melalui mitra kami, ${provider?.name}.`
                        : 'Layanan ini belum terhubung ke penyedia. Silakan hubungi admin.'
                    }
                </p>
                 <div className={`space-y-4 ${!isConnected ? 'opacity-70' : ''}`}>
                     <div>
                        <label className="text-sm font-bold text-text-secondary">Pilih Kampanye</label>
                        <select disabled={!isConnected} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color disabled:cursor-not-allowed">
                            <option>-- Kampanye Tersedia --</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-bold text-text-secondary">Jumlah Donasi (IDR)</label>
                        <input type="number" disabled={!isConnected} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color disabled:cursor-not-allowed" />
                    </div>
                    <button onClick={handleDonate} disabled={!isConnected} className={`w-full p-3 font-bold rounded-lg ${isConnected ? 'btn-primary' : 'bg-gray-600 cursor-not-allowed'}`}>
                        Donasi Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DonationScreen;