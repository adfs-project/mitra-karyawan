import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, TicketIcon, PuzzlePieceIcon, GiftIcon } from '@heroicons/react/24/solid';

const categories = [
    { name: 'Tiket Bioskop', icon: TicketIcon },
    { name: 'Voucher Game', icon: PuzzlePieceIcon },
    { name: 'Donasi', icon: GiftIcon },
];

const LifestyleScreen = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Gaya Hidup</h1>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <p className="text-text-secondary mb-4">Temukan voucher, tiket, dan layanan gaya hidup lainnya. Fitur ini sedang dalam pengembangan.</p>
                <div className="grid grid-cols-3 gap-4">
                    {categories.map(category => (
                        <div key={category.name} className="flex flex-col items-center p-4 bg-surface-light rounded-lg border border-border-color cursor-not-allowed opacity-70">
                            <category.icon className="h-10 w-10 text-secondary mb-2" />
                            <span className="font-semibold text-sm text-center">{category.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LifestyleScreen;
