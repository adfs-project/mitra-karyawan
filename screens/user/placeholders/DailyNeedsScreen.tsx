import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MagnifyingGlassIcon, ClockIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';

const DailyNeedsScreen = () => {
    const navigate = useNavigate();

    // Mock categories for UI display
    const categories = ['Semua', 'Minuman', 'Makanan Ringan', 'Perlengkapan Kantor'];

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Belanja Harian</h1>
            </div>

            <div className="bg-secondary/20 border border-secondary text-secondary p-4 rounded-lg flex items-center space-x-3">
                <ClockIcon className="h-8 w-8 flex-shrink-0" />
                <div>
                    <p className="font-bold">Segera Hadir!</p>
                    <p className="text-sm">Fitur belanja kebutuhan harian langsung dari koperasi akan segera tersedia di sini.</p>
                </div>
            </div>

            {/* Disabled UI for placeholder effect */}
            <div className="opacity-50 pointer-events-none">
                <div className="sticky top-[72px] bg-background py-2 z-5">
                    <div className="relative mb-2">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                        <input 
                            type="text"
                            placeholder="Cari kebutuhan harian..."
                            disabled
                            className="w-full p-3 pl-10 bg-surface border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                disabled
                                className={`px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${cat === 'Semua' ? 'bg-primary text-black' : 'bg-surface-light text-text-secondary'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-center py-16">
                <ShoppingBagIcon className="h-20 w-20 mx-auto text-text-secondary opacity-50"/>
                <p className="mt-4 font-semibold text-text-secondary">Fitur Belanja Harian sedang dalam pengembangan.</p>
            </div>
        </div>
    );
};

export default DailyNeedsScreen;
