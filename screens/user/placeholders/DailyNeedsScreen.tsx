import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../contexts/DataContext';
import { ArrowLeftIcon, MagnifyingGlassIcon, ShoppingCartIcon, ClockIcon } from '@heroicons/react/24/solid';
import { Product } from '../../../types';

const DailyNeedsScreen = () => {
    const navigate = useNavigate();
    const { products, addToCart } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    const dailyNeedsCategories = useMemo(() => 
        [...new Set(products.filter(p => p.sellerName === 'Koperasi Mitra').map(p => p.category))]
    , [products]);

    const dailyNeedsProducts = useMemo(() => {
        return products.filter(p => dailyNeedsCategories.includes(p.category));
    }, [products, dailyNeedsCategories]);
    
    const categories = useMemo(() => ['Semua', ...dailyNeedsCategories], [dailyNeedsCategories]);

    const filteredProducts = useMemo(() => {
        return dailyNeedsProducts.filter(p => {
            const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [dailyNeedsProducts, selectedCategory, searchTerm]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

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
                    <p className="font-bold">Promo Jam Kantor!</p>
                    <p className="text-sm">Dapatkan gratis ongkir untuk pesanan di atas Rp 50.000 antara jam 10:00 - 14:00.</p>
                </div>
            </div>

            <div className="sticky top-[72px] bg-background py-2 z-5">
                <div className="relative mb-2">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    <input 
                        type="text"
                        placeholder="Cari kebutuhan harian..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 bg-surface border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-black' : 'bg-surface-light text-text-secondary'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-surface p-3 rounded-lg flex items-center space-x-4 border border-border-color">
                        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="font-semibold text-text-primary">{product.name}</p>
                            <p className="font-bold text-primary">{formatCurrency(product.price)}</p>
                        </div>
                        <button 
                            onClick={() => addToCart(product.id, 1)} 
                            className="btn-primary p-3 rounded-full hover:scale-110 transition-transform"
                            aria-label={`Tambah ${product.name} ke keranjang`}
                        >
                            <ShoppingCartIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-text-secondary opacity-50"/>
                        <p className="mt-4 text-text-secondary">Produk tidak ditemukan.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyNeedsScreen;