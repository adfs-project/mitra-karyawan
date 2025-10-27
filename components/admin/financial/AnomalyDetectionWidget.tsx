import React from 'react';
import { ShieldExclamationIcon, LockClosedIcon } from '@heroicons/react/24/solid';

const AnomalyDetectionWidget: React.FC = () => {
    return (
        <div className="bg-surface p-6 rounded-lg border border-yellow-500/50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                    <ShieldExclamationIcon className="h-5 w-5 mr-2 text-yellow-400" />
                    AI Anomaly Detection
                </h2>
                <button disabled={true} className="btn-secondary px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    Scan
                </button>
            </div>
            <div className="text-center py-8">
                <LockClosedIcon className="h-12 w-12 text-text-secondary mx-auto opacity-50" />
                <h3 className="mt-4 font-semibold text-text-primary">Fitur Dinonaktifkan</h3>
                <p className="text-text-secondary text-sm mt-1 max-w-sm mx-auto">
                    Untuk mematuhi protokol privasi data "Zero Data Access", fitur pemindaian transaksi oleh AI telah dinonaktifkan secara permanen.
                </p>
            </div>
        </div>
    );
};

export default AnomalyDetectionWidget;
