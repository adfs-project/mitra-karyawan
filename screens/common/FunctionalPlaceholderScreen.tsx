import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, LightBulbIcon } from '@heroicons/react/24/solid';

const FunctionalPlaceholderScreen: React.FC = () => {
    const { featureName } = useParams<{ featureName: string }>();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center text-center h-full p-6">
            <div className="bg-surface p-8 rounded-lg border border-border-color max-w-lg">
                <LightBulbIcon className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-text-primary">
                    {featureName || 'Fitur'}
                </h1>
                <p className="text-text-secondary mt-4">
                    Ini adalah halaman placeholder fungsional. Dalam aplikasi nyata, antarmuka dan logika untuk fitur ini akan ditampilkan di sini.
                </p>
                 <p className="text-xs text-text-secondary mt-2">
                    (Mode Demo Aktif)
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="btn-secondary flex items-center px-6 py-2 rounded-lg font-bold mt-8"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Kembali
                </button>
            </div>
        </div>
    );
};

export default FunctionalPlaceholderScreen;
