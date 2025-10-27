import React from 'react';
import { WrenchScrewdriverIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const UnderConstructionScreen: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="space-y-8 flex flex-col items-center justify-center text-center h-full p-4">
            <WrenchScrewdriverIcon className="h-24 w-24 text-border-color" />
            <h1 className="text-3xl font-bold text-primary">Segera Hadir</h1>
            <p className="text-text-secondary max-w-md">
                Maaf, menu ini masih dalam pengembangan. Tim kami sedang bekerja keras untuk menghadirkannya untuk Anda.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="btn-secondary flex items-center px-6 py-2 rounded-lg font-bold"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Kembali
            </button>
        </div>
    );
};

export default UnderConstructionScreen;
