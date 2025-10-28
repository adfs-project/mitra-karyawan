import React, { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const CartScreen: React.FC = () => {
    const { cart, products, removeFromCart, updateCartQuantity, checkoutCart, showToast } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const cartDetails = useMemo(() => {
        return cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            return { ...item, product };
        }).filter(item => item.product); // Filter out items where product might not be found
    }, [cart, products]);

    const subtotal = useMemo(() => {
        return cartDetails.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0);
    }, [cartDetails]);

    const handleCheckout = async () => {
        if (!user || subtotal <= 0) return;

        setIsCheckingOut(true);
        // FIX: Expected 0 arguments, but got 1. The checkoutCart function does not take any arguments.
        const result = await checkoutCart();

        if (result.success) {
            showToast(result.message, "success");
            navigate('/wallet');
        } else {
             showToast(`Checkout failed: ${result.message}`, "error");
        }
        setIsCheckingOut(false);
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-primary flex items-center">
                <ShoppingCartIcon className="h-7 w-7 mr-2" /> Keranjang Belanja
            </h1>

            {cartDetails.length > 0 ? (
                <div className="space-y-4">
                    <div className="bg-surface p-4 rounded-lg border border-border-color space-y-4">
                        {cartDetails.map(item => (
                            <div key={item.productId} className="flex items-center space-x-4">
                                <img src={item.product!.imageUrl} alt={item.product!.name} className="w-16 h-16 rounded-md object-cover" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-text-primary text-sm">{item.product!.name}</p>
                                    <p className="text-xs text-text-secondary">Oleh: {item.product!.sellerName}</p>
                                    <p className="font-bold text-primary text-sm mt-1">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.product!.price)}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="number" value={item.quantity} onChange={(e) => updateCartQuantity(item.productId, parseInt(e.target.value, 10))} 
                                        min="1" max={item.product!.stock} className="w-16 bg-surface-light border border-border-color rounded-md p-1 text-center"/>
                                    <button onClick={() => removeFromCart(item.productId)}>
                                        <TrashIcon className="h-5 w-5 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-surface p-4 rounded-lg border border-border-color space-y-2">
                        <h2 className="text-lg font-bold">Ringkasan Pesanan</h2>
                        <div className="flex justify-between text-text-secondary">
                            <p>Subtotal</p>
                            <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(subtotal)}</p>
                        </div>
                        <div className="flex justify-between font-bold text-text-primary text-lg border-t border-border-color pt-2 mt-2">
                            <p>Total</p>
                            <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(subtotal)}</p>
                        </div>
                        <button onClick={handleCheckout} disabled={isCheckingOut} className="w-full btn-primary p-3 rounded-lg font-bold mt-2 flex justify-center items-center">
                            {isCheckingOut ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : `Checkout (${cartDetails.length} item)`}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20">
                    <ShoppingCartIcon className="h-20 w-20 mx-auto text-text-secondary" />
                    <h2 className="mt-4 text-xl font-semibold text-text-primary">Keranjang Anda Kosong</h2>
                    <p className="text-text-secondary mt-2">Ayo jelajahi marketplace dan temukan barang favoritmu!</p>
                    <Link to="/market" className="mt-6 inline-block btn-secondary px-6 py-2 rounded-lg font-bold">
                        Mulai Belanja
                    </Link>
                </div>
            )}
        </div>
    );
};

export default CartScreen;