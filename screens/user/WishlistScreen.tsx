import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useMarketplace } from '../../hooks/useMarketplace';

const WishlistScreen: React.FC = () => {
    const { user } = useAuth();
    const { products, toggleWishlist, addToCart } = useMarketplace();

    const wishlistProducts = products.filter(p => user?.wishlist.includes(p.id));

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-primary flex items-center">
                <HeartSolidIcon className="h-7 w-7 mr-2 text-red-500" /> Wishlist Saya
            </h1>

            {wishlistProducts.length > 0 ? (
                <div className="space-y-4">
                    {wishlistProducts.map(product => (
                         <div key={product.id} className="bg-surface p-4 rounded-lg border border-border-color flex items-center space-x-4">
                            <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-md object-cover" />
                            <div className="flex-grow">
                                <p className="font-semibold text-text-primary">{product.name}</p>
                                <p className="text-xs text-text-secondary">Oleh: {product.sellerName}</p>
                                <p className="font-bold text-primary text-lg mt-1">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</p>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <button onClick={() => addToCart(product.id, 1)} className="p-2 bg-primary/20 rounded-full hover:bg-primary/30">
                                    <ShoppingCartIcon className="h-5 w-5 text-primary" />
                                </button>
                                <button onClick={() => toggleWishlist(product.id)} className="p-2 bg-red-500/10 rounded-full hover:bg-red-500/20">
                                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <HeartIcon className="h-20 w-20 mx-auto text-text-secondary" />
                    <h2 className="mt-4 text-xl font-semibold text-text-primary">Wishlist Anda Kosong</h2>
                    <p className="text-text-secondary mt-2">Simpan barang yang Anda suka dengan menekan ikon hati di halaman marketplace.</p>
                    <Link to="/market" className="mt-6 inline-block btn-secondary px-6 py-2 rounded-lg font-bold">
                        Jelajahi Marketplace
                    </Link>
                </div>
            )}
        </div>
    );
};

export default WishlistScreen;
