import React, { useState, useEffect } from 'react';
// FIX: Replaced useData with useCore as it is the correct exported member from DataContext.
import { useCore } from '../../contexts/DataContext';
import { BanknotesIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';

const AdminTaxManagement: React.FC = () => {
    const { taxConfig, updateTaxConfig, adminWallets } = useCore();
    const [config, setConfig] = useState(taxConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setConfig(taxConfig);
    }, [taxConfig]);

    const handleSave = () => {
        setIsSaving(true);
        updateTaxConfig(config);
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Tax Management</h1>
            <p className="text-text-secondary">Atur tarif pajak yang berlaku di platform dan lihat total pajak yang terkumpul.</p>
            
            <div className="bg-surface-light p-6 rounded-lg border border-border-color">
                <p className="text-sm text-text-secondary">Total Pajak Terkumpul (PPN & PPh)</p>
                <p className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(adminWallets.tax)}
                </p>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4 flex items-center"><Cog6ToothIcon className="h-6 w-6 mr-2" /> Konfigurasi Pajak</h2>
                <div className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Tarif PPN (%)</label>
                        <input 
                            type="number" 
                            step="0.1" 
                            min="0" 
                            max="100"
                            value={config.ppnRate * 100}
                            onChange={(e) => setConfig(prev => ({ ...prev, ppnRate: parseFloat(e.target.value) / 100 }))}
                            className="w-full p-2 bg-surface-light rounded border border-border-color"
                        />
                        <p className="text-xs text-text-secondary mt-1">Pajak Pertambahan Nilai yang dikenakan pada transaksi yang relevan.</p>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Tarif PPh 21 (%)</label>
                        <input 
                            type="number" 
                            step="0.1" 
                            min="0"
                            max="100"
                            value={config.pph21Rate * 100}
                             onChange={(e) => setConfig(prev => ({ ...prev, pph21Rate: parseFloat(e.target.value) / 100 }))}
                            className="w-full p-2 bg-surface-light rounded border border-border-color"
                        />
                         <p className="text-xs text-text-secondary mt-1">Pajak Penghasilan yang dipotong dari pendapatan (misal: fee dokter).</p>
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

export default AdminTaxManagement;