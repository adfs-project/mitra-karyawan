import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/solid';
import { useData } from '../../../contexts/DataContext';
import ProductCard from '../../../components/user/market/ProductCard';
import { Product } from '../../../types';

const DailyNeedsScreen = () => {
    const navigate = useNavigate();
    const { products, addToCart } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Filter products sold only by the cooperative (sellerId: 'admin-001')
    const cooperativeProducts = useMemo(() => 
        products.filter(p => p.sellerId === 'admin-001'), 
    [products]);

    const categories = useMemo(() => 
        ['All', ...new Set(cooperativeProducts.map(p => p.category))], 
    [cooperativeProducts]);

    const filteredProducts = useMemo(() => {
        return cooperativeProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [cooperativeProducts, searchTerm, categoryFilter]);
    
    const handleBuyClick = (product: Product) => {
        addToCart(product.id, 1);
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-primary">Belanja Harian</h1>
                    <p className="text-text-secondary text-sm">Beli kebutuhan harian langsung dari Koperasi Karyawan.</p>
                </div>
            </div>

            <div className="sticky top-[72px] bg-background py-2 z-5">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    <input 
                        type="text"
                        placeholder="Cari produk di koperasi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 bg-surface border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="relative mt-2">
                    <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-surface border border-border-color rounded-md py-2 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-primary appearance-none text-sm">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onBuyClick={handleBuyClick} />
                    ))}
                </div>
                {filteredProducts.length === 0 && (
                    <p className="text-center text-text-secondary py-8">Tidak ada produk yang cocok dengan pencarian Anda.</p>
                )}
            </div>
        </div>
    );
};

export default DailyNeedsScreen;