import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';
import { ShoppingCartIcon, StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { useMarketplace } from '../../../hooks/useMarketplace';

const ImagePlaceholder: React.FC = () => (
    <div className="w-full h-32 bg-surface-light animate-pulse"></div>
);

const ProductCard: React.FC<{
    product: Product;
    onBuyClick: (product: Product) => void;
}> = ({ product, onBuyClick }) => {
    const { user } = useAuth();
    const { toggleWishlist, addToCart } = useMarketplace();
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '0px 0px 100px 0px' // Load images 100px before they enter viewport
            }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
    }, []);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(product.id, 1);
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleWishlist(product.id);
    };

    const isInWishlist = user?.wishlist.includes(product.id);

    return (
        <div ref={cardRef} className="bg-surface rounded-lg overflow-hidden border border-border-color flex flex-col relative">
            <button onClick={handleToggleWishlist} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full z-10">
                {isInWishlist ? <HeartSolidIcon className="h-5 w-5 text-red-500" /> : <HeartOutlineIcon className="h-5 w-5 text-white" />}
            </button>
            
            {isVisible ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover" />
            ) : (
                <ImagePlaceholder />
            )}
            
            <div className="p-3 flex flex-col flex-grow">
                <h3 className="font-semibold text-sm truncate text-text-primary">{product.name}</h3>
                <p className="text-xs text-text-secondary truncate">{product.sellerName}</p>
                <div className="flex items-center text-xs text-yellow-400 mt-1">
                    <StarSolidIcon className="h-4 w-4 mr-1" />
                    <span className="font-bold">{product.rating.toFixed(1)}</span>
                    <span className="text-text-secondary ml-1">({product.reviewCount})</span>
                </div>
                <div className="flex-grow mt-1">
                    <p className="font-bold text-primary">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}
                    </p>
                </div>
                <div className="flex space-x-2 mt-2">
                    <button onClick={handleAddToCart} disabled={product.stock === 0}
                        className="flex-grow bg-primary/20 text-primary text-sm py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                        + Keranjang
                    </button>
                    <button onClick={() => onBuyClick(product)} disabled={product.stock === 0}
                        className="w-10 btn-primary text-sm py-1.5 rounded flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed">
                        <ShoppingCartIcon className="h-4 w-4" />
                    </button>
                </div>
                {product.stock === 0 && <p className="text-xs text-center text-red-500 mt-1">Stok Habis</p>}
            </div>
        </div>
    );
};

export default ProductCard;