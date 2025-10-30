import React, { useState, useMemo, useEffect } from 'react';
// FIX: Replaced useCore with useApp as it is the correct exported member from AppContext.
import { useApp } from '../../contexts/AppContext';
import { BanknotesIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-surface-light p-4 rounded-lg border border-border-color">
        <p className="text-sm text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
    </div>
);

const AdminMonetizationEngine: React.FC = () => {
    const { monetizationConfig, updateMonetizationConfig, articles, transactions } = useApp();
    const [config, setConfig] = useState(monetizationConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setConfig(monetizationConfig);
    }, [monetizationConfig]);

    const handleSave = () => {
        setIsSaving(true);
        updateMonetizationConfig(config);
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 1000);
    };

    const totalAdRevenue = useMemo(() => 
        articles.reduce((sum, article) => sum + (article.monetization?.revenueGenerated || 0), 0),
    [articles]);

    const totalMarketplaceCommission = useMemo(() => {
        const marketplaceSales = transactions
            .filter(tx => tx.type === 'Marketplace' && tx.status === 'Completed')
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        return marketplaceSales * monetizationConfig.marketplaceCommission;
    }, [transactions, monetizationConfig.marketplaceCommission]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Monetization Engine</h1>
            <p className="text-text-secondary">Atur strategi monetisasi platform dan pantau hasilnya.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Total Komisi Marketplace" 
                    value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalMarketplaceCommission)} 
                />
                <StatCard 
                    title="Total Pendapatan Iklan" 
                    value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAdRevenue)} 
                />
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4 flex items-center"><Cog6ToothIcon className="h-6 w-6 mr-2" /> Konfigurasi</h2>
                <div className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Komisi Marketplace (%)</label>
                        <input 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            max="100"
                            value={config.marketplaceCommission * 100}
                            onChange={(e) => setConfig(prev => ({ ...prev, marketplaceCommission: parseFloat(e.target.value) / 100 }))}
                            className="w-full p-2 bg-surface-light rounded border border-border-color"
                        />
                        <p className="text-xs text-text-secondary mt-1">Persentase yang diambil dari setiap penjualan di marketplace.</p>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Biaya Pemasaran (CPA - IDR)</label>
                        <input 
                            type="number" 
                            step="500" 
                            min="0"
                            value={config.marketingCPA}
                             onChange={(e) => setConfig(prev => ({ ...prev, marketingCPA: parseInt(e.target.value, 10) }))}
                            className="w-full p-2 bg-surface-light rounded border border-border-color"
                        />
                         <p className="text-xs text-text-secondary mt-1">Biaya per akuisisi untuk kampanye pemasaran (simulasi).</p>
                    </div>
                    <div className="flex justify-end items-center space-x-4">
                         {saved && <p className="text-sm text-green-400 animate-fade-out">Pengaturan disimpan!</p>}
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="btn-primary px-6 py-2 rounded font-bold w-32 flex justify-center"
                        >
                           {isSaving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Simpan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMonetizationEngine;