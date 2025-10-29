import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, FilmIcon } from '@heroicons/react/24/solid';

const CinemaTicketScreen = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Tiket Bioskop</h1>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <p className="text-text-secondary mb-4">Pesan tiket film favorit Anda. Fitur ini sedang dalam pengembangan.</p>
                <div className="space-y-4 opacity-70">
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Pilih Film</label>
                        <select disabled className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color cursor-not-allowed">
                            <option>-- Film Sedang Tayang --</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Pilih Lokasi</label>
                         <select disabled className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color cursor-not-allowed">
                            <option>-- Pilih Bioskop --</option>
                        </select>
                    </div>
                     <button disabled className="w-full p-3 bg-gray-600 font-bold rounded-lg cursor-not-allowed">
                        Cari Jadwal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CinemaTicketScreen;