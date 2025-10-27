
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useLocation } from 'react-router-dom';
import ProductCard from '../../components/user/market/ProductCard';
import { Product } from '../../types';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import AiRecommendations from '../../components/user/market/AiRecommendations';

const MarketScreen: React.FC = () => {
    const { products } = useData();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState(location.state?.searchQuery || '');
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, categoryFilter]);
    
    const handleBuyClick = (product: Product) => {
        // In a real app, this might navigate to a product detail page or open a purchase modal
        alert(`Navigating to purchase flow for ${product.name}`);
    };

    return (
        <div className="p-4 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-primary">Marketplace</h1>
                <p className="text-text-secondary">Jual beli barang antar karyawan.</p>
            </div>
            
            <div className="sticky top-0 bg-background py-2 z-5">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    <input 
                        type="text"
                        placeholder="Cari barang..."
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

            <AiRecommendations searchTerm={searchTerm} />

            <div>
                <h2 className="text-lg font-bold text-text-primary mb-4">Semua Produk</h2>
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

export default MarketScreen;
