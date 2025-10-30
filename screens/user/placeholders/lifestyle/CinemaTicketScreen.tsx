import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useApp } from '../../../../contexts/AppContext';

const ProviderLogo = ({ providerName }: { providerName: string }) => {
    const [logoError, setLogoError] = useState(false);
    const sanitizedName = providerName.toLowerCase().replace(/\s+/g, '');
    const logoUrl = `https://logo.clearbit.com/${sanitizedName}.com`;

    if (logoError) {
        return (
            <div className="h-8 w-8 rounded-full bg-border-color flex items-center justify-center font-bold text-text-secondary flex-shrink-0">
                {providerName.charAt(0)}
            </div>
        );
    }
    return <img src={logoUrl} alt={`${providerName} logo`} className="h-8 w-8 rounded-full bg-white" onError={() => setLogoError(true)} />;
};


const CinemaTicketScreen = () => {
    const navigate = useNavigate();
    // FIX: Replaced useCore with useApp and consolidated hooks.
    const { serviceLinkage, apiIntegrations, showToast } = useApp();

    const provider = apiIntegrations.find(api => api.id === serviceLinkage['lifestyle-cinema']);
    const isConnected = !!provider;

    const handleSearch = () => {
        if (provider) {
            showToast(`Mencari jadwal film via ${provider.name}... (Simulasi)`, 'info');
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Tiket Bioskop</h1>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                 {isConnected && provider && (
                    <div className="mb-4 flex items-center space-x-3 bg-surface-light p-3 rounded-lg border border-border-color">
                        <ProviderLogo providerName={provider.name} />
                        <p className="text-sm text-text-secondary">Layanan ini ditenagai oleh <span className="font-bold text-text-primary">{provider.name}</span></p>
                    </div>
                )}
                <p className="text-text-secondary mb-4">
                    {isConnected 
                        ? `Pesan tiket film favorit Anda.`
                        : 'Layanan ini belum terhubung ke penyedia. Silakan hubungi admin.'
                    }
                </p>
                <div className={`space-y-4 ${!isConnected ? 'opacity-70' : ''}`}>
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Pilih Film</label>
                        <select disabled={!isConnected} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color disabled:cursor-not-allowed">
                            <option>-- Film Sedang Tayang --</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Pilih Lokasi</label>
                         <select disabled={!isConnected} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color disabled:cursor-not-allowed">
                            <option>-- Pilih Bioskop --</option>
                        </select>
                    </div>
                     <button onClick={handleSearch} disabled={!isConnected} className={`w-full p-3 font-bold rounded-lg ${isConnected ? 'btn-primary' : 'bg-gray-600 cursor-not-allowed'}`}>
                        Cari Jadwal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CinemaTicketScreen;