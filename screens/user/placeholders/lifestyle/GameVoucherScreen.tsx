import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PuzzlePieceIcon } from '@heroicons/react/24/solid';

const GameVoucherScreen = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Voucher Game</h1>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <p className="text-text-secondary mb-4">Top-up game favorit Anda dengan cepat dan mudah. Fitur ini sedang dalam pengembangan.</p>
                <div className="space-y-4 opacity-70">
                     <div>
                        <label className="text-sm font-bold text-text-secondary">Pilih Game</label>
                        <select disabled className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color cursor-not-allowed">
                            <option>-- Game Populer --</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary">User ID</label>
                        <input type="text" disabled className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color cursor-not-allowed" />
                    </div>
                    <button disabled className="w-full p-3 bg-gray-600 font-bold rounded-lg cursor-not-allowed">
                        Pilih Nominal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameVoucherScreen;