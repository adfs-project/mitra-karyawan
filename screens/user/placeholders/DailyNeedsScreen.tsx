import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Import useMarketplace from hooks directory.
import { useMarketplace } from '../../../hooks/useMarketplace';
import { ArrowLeftIcon, MagnifyingGlassIcon, ShoppingCartIcon, ClockIcon } from '@heroicons/react/24/solid';
import { Product } from '../../../types';

const DailyNeedsScreen = () => {
    const navigate = useNavigate();
    // FIX: Get products and addToCart from useMarketplace hook.
    const { products, addToCart } = useMarketplace();
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
                <div className="flex space-x-2 overflow-