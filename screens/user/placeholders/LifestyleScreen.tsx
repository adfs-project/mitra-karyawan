import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, TicketIcon, PuzzlePieceIcon, GiftIcon } from '@heroicons/react/24/solid';

const categories = [
    { name: 'Tiket Bioskop', icon: TicketIcon, path: '/lifestyle/cinema' },
    { name: 'Voucher Game', icon: PuzzlePieceIcon, path: '/lifestyle/game-voucher' },
    { name: 'Donasi', icon: GiftIcon, path: '/lifestyle/donation' },
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
                <p className="text-text-secondary mb-4">Temukan voucher, tiket, dan layanan gaya hidup lainnya.</p>
                <div className="grid grid-cols-3 gap-4">
                    {categories.map(category => (
                        <Link key={category.name} to={category.path} className="flex flex-col items-center p-4 bg-surface-light rounded-lg border border-border-color hover:border-primary transition-colors">
                            <category.icon className="h-10 w-10 text-secondary mb-2" />
                            <span className="font-semibold text-sm text-center text-text-primary">{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LifestyleScreen;