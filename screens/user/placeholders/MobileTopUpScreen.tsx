import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const nominals = [25000, 50000, 100000, 200000];

const MobileTopUpScreen = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Pulsa & Data</h1>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <p className="text-text-secondary mb-4">Isi ulang pulsa dan paket data untuk semua operator. Fitur ini sedang dalam pengembangan.</p>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Nomor Ponsel</label>
                        <input type="tel" disabled className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color cursor-not-allowed" placeholder="081234567890" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Pilih Nominal</label>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            {nominals.map(nom => (
                                <button key={nom} disabled className="p-3 bg-surface-light rounded-lg border border-border-color text-left cursor-not-allowed opacity-70">
                                    <p className="font-bold text-text-primary">{new Intl.NumberFormat('id-ID').format(nom)}</p>
                                    <p className="text-xs text-text-secondary">Harga: {new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR'}).format(nom + 1500)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <button disabled className="w-full p-3 bg-gray-600 font-bold rounded-lg cursor-not-allowed">
                        Beli
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileTopUpScreen;
