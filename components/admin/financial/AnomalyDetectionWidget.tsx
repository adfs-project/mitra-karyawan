import React, { useState } from 'react';
import { ShieldExclamationIcon, LockClosedIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { useData } from '../../../packages/shared/contexts/DataContext';

const AnomalyDetectionWidget: React.FC = () => {
    const { homePageConfig, runAnomalyScan } = useData();
    const isEnabled = homePageConfig.featureFlags.aiAnomalyDetection;
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<'idle' | 'success'>('idle');

    const handleScan = async () => {
        if (isScanning) return;
        setIsScanning(true);
        setScanResult('idle');
        await runAnomalyScan();
        setIsScanning(false);
        setScanResult('success');
        // Reset the success message after a few seconds
        setTimeout(() => setScanResult('idle'), 5000);
    };

    return (
        <div className={`bg-surface p-6 rounded-lg border ${isEnabled ? 'border-primary/50' : 'border-yellow-500/50'}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                    <ShieldExclamationIcon className={`h-5 w-5 mr-2 ${isEnabled ? 'text-primary' : 'text-yellow-400'}`} />
                    AI Anomaly Detection
                </h2>
                <button onClick={handleScan} disabled={!isEnabled || isScanning} className="btn-secondary px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed w-28 flex justify-center items-center">
                    {isScanning ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : 'Scan Now'}
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
                    {scanResult === 'success' ? (
                        <>
                            <ShieldCheckIcon className="h-12 w-12 text-green-400 mx-auto animate-pulse" />
                            <h3 className="mt-4 font-semibold text-green-400">Scan Selesai</h3>
                            <p className="text-text-secondary text-sm mt-1 max-w-sm mx-auto">
                                Pemindaian manual selesai. Tidak ada anomali baru yang ditemukan.
                            </p>
                        </>
                    ) : (
                        <>
                             <ShieldCheckIcon className="h-12 w-12 text-primary mx-auto" />
                            <h3 className="mt-4 font-semibold text-text-primary">Sistem Aktif</h3>
                            <p className="text-text-secondary text-sm mt-1 max-w-sm mx-auto">
                                AI sedang memantau transaksi secara real-time. Jalankan pemindaian manual untuk memeriksa data historis.
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnomalyDetectionWidget;