import React from 'react';
import { ShieldExclamationIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { useApp } from '../../../contexts/AppContext';

const AnomalyDetectionWidget: React.FC = () => {
    const { homePageConfig } = useApp();
    const isEnabled = homePageConfig.featureFlags.aiAnomalyDetection;

    return (
        <div className={`bg-surface p-6 rounded-lg border ${isEnabled ? 'border-primary/50' : 'border-yellow-500/50'}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                    <ShieldExclamationIcon className={`h-5 w-5 mr-2 ${isEnabled ? 'text-primary' : 'text-yellow-400'}`} />
                    AI Anomaly Detection
                </h2>
                <button disabled={!isEnabled} className="btn-secondary px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    Scan Now
                </button>
            </div>
            {!isEnabled ? (
                <div className="text-center py-8">
                    <LockClosedIcon className="h-12 w-12 text-text-secondary mx-auto opacity-50" />
                    <h3 className="mt-4 font-semibold text-text-primary">Fitur Dinonaktifkan</h3>
                    <p className="text-text-secondary text-sm mt-1 max-w-sm mx-auto">
                        Aktifkan fitur ini di menu System Controls untuk memulai pemindaian anomali transaksi oleh AI.
                    </p>
                </div>
            ) : (
                 <div className="text-center py-8">
                    <ShieldCheckIcon className="h-12 w-12 text-primary mx-auto" />
                    <h3 className="mt-4 font-semibold text-text-primary">Sistem Aktif</h3>
                    <p className="text-text-secondary text-sm mt-1 max-w-sm mx-auto">
                        AI sedang memantau transaksi secara real-time. Tidak ada anomali yang terdeteksi dalam 24 jam terakhir.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AnomalyDetectionWidget;