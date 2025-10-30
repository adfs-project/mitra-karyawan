import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../../components/user/market/ProductCard';
import { Product } from '../../types';
import { MagnifyingGlassIcon, FunnelIcon, SparklesIcon } from '@heroicons/react/24/outline';
import AiRecommendations from '../../components/user/market/AiRecommendations';
import { usePersonalization } from '../../contexts/PersonalizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useMarketplace } from '../../contexts/MarketplaceContext';

const AiPoweredRecommendations: React.FC = () => {
    const { user } = useAuth();
    const { products, addToCart } = useMarketplace();
    const { interestProfiles } = usePersonalization();

    const recommendedProducts = useMemo(() => {
        if (!user) return [];
        const tags = interestProfiles[user.id] || [];
        if (tags.length === 0) return [];

        const scoredProducts = products.map(product => {
            let score = 0;
            const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
            tags.forEach(tag => {
                if (productText.includes(tag.toLowerCase())) {
                    score++;
                }
            });
            return { product, score };
        });

        return scoredProducts
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map(item => item.product);
            
    }, [products, user, interestProfiles]);

    if (recommendedProducts.length === 0) return null;

    return (
        <div>
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-primary" />
                Rekomendasi AI Untuk Anda
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recommendedProducts.map(product => (
                    <ProductCard key={product.id} product={product} onBuyClick={() => addToCart(product.id, 1)} />
                ))}
            </div>
        </div>
    );
};


const MarketScreen: React.FC = () => {
    const { products, addToCart } = useMarketplace();
    const { user } = useAuth();
    const { interestProfiles } = usePersonalization();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState(location.state?.searchQuery || '');
    const [categoryFilter, setCategoryFilter] = useState('All');
    
    const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);
    
    const recommendedProductIds = useMemo(() => {
        if (!user) return new Set();
        const tags = interestProfiles[user.id] || [];
        if (tags.length === 0) return new Set();

        const scoredProducts = products.map(product => {
            let score = 0;
            const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
            tags.forEach(tag => {
                if (productText.includes(tag.toLowerCase())) {
                    score++;
                }
            });
            return { product, score };
        });

        return new Set(scoredProducts
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map(item => item.product.id));
    }, [products, user, interestProfiles]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            if (recommendedProductIds.has(product.id)) return false; // Exclude recommended products from the main list
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  product.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, categoryFilter, recommendedProductIds]);
    
    const handleBuyClick = (product: Product) => {
        addToCart(product.id, 1);
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

            <AiPoweredRecommendations />

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