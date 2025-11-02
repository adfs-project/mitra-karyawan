import React, { createContext, useContext, ReactNode, useCallback, useState } from 'react';
import { Product, Role, CartItem, Order } from '../types';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';
import vaultService from '../services/vaultService';

export interface MarketplaceContextType {
    products: Product[];
    cart: CartItem[];
    orders: Order[];
    addToCart: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    checkoutCart: () => Promise<{ success: boolean; message: string }>;
    toggleWishlist: (productId: string) => void;
    addProduct: (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount' | 'status' | 'createdAt'>) => Promise<void>;
    updateProduct: (productData: Product) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    updateProductStatus: (productId: string, status: Product['status']) => Promise<void>;
    addMultipleProductsByAdmin: (productsData: any[]) => Promise<{ success: number; failed: number; errors: string[] }>;
}

export const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, updateCurrentUser } = useAuth();
    const { addTransaction, showToast, addNotification } = useApp();
    
    // State is now managed locally within this context
    const [products, setProducts] = useState<Product[]>(() => vaultService.getSanitizedData().products);
    const [cart, setCart] = useState<CartItem[]>(() => vaultService.getSanitizedData().cart);
    const [orders, setOrders] = useState<Order[]>(() => vaultService.getSanitizedData().orders);

    const updateProductsState = (newProducts: Product[]) => {
        setProducts(newProducts);
        vaultService.setData('products', newProducts);
    }
    const updateCartState = (newCart: CartItem[]) => {
        setCart(newCart);
        vaultService.setData('cart', newCart);
    }
    const updateOrdersState = (newOrders: Order[]) => {
        setOrders(newOrders);
        vaultService.setData('orders', newOrders);
    }

    const addToCart = useCallback((productId: string, quantity: number) => {
        if (!user) { showToast('You must be logged in...', 'error'); return; }
        const product = products.find(p => p.id === productId);
        if (!product || product.stock < quantity) { showToast('Product not available or not enough stock.', 'warning'); return; }
        
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === productId);
            let newCart;
            if (existingItem) {
                newCart = prevCart.map(item => item.productId === productId ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } : item);
            } else {
                newCart = [...prevCart, { productId, quantity }];
            }
            vaultService.setData('cart', newCart);
            return newCart;
        });
        showToast(`${product.name} added to cart.`, 'success');
    }, [user, products, showToast]);

    const removeFromCart = useCallback((productId: string) => {
        updateCartState(cart.filter(item => item.productId !== productId));
        showToast('Item removed from cart.', 'info');
    }, [cart, showToast]);

    const updateCartQuantity = useCallback((productId: string, quantity: number) => {
        const product = products.find(p => p.id === productId);
        if (quantity < 1) { removeFromCart(productId); return; }
        if (product && quantity > product.stock) {
            showToast(`Only ${product.stock} items in stock.`, 'warning');
            updateCartState(cart.map(item => item.productId === productId ? { ...item, quantity: product.stock } : item));
            return;
        }
        updateCartState(cart.map(item => item.productId === productId ? { ...item, quantity } : item));
    }, [products, cart, removeFromCart, showToast]);

    const checkoutCart = useCallback(async (): Promise<{ success: boolean; message: string }> => {
        if (!user) return { success: false, message: 'User not logged in.' };
        
        const cartDetails = cart.map(item => ({...item, product: products.find(p => p.id === item.productId)})).filter(item => item.product);
        const subtotal = cartDetails.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0);

        if (subtotal <= 0) return { success: false, message: 'Cart is empty.' };

        const txResult = await addTransaction({ userId: user.id, type: 'Marketplace', amount: -subtotal, description: `Purchase of ${cartDetails.length} items`, status: 'Completed' });
        if (!txResult.success) return txResult;

        const newOrder: Order = { id: `ord-${Date.now()}`, userId: user.id, items: cartDetails.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.product!.price, productName: item.product!.name })), total: subtotal, timestamp: new Date().toISOString() };
        updateOrdersState([...orders, newOrder]);

        const sellerTransactions: Record<string, number> = {};
        const updatedProducts = [...products];

        for (const item of cartDetails) {
            sellerTransactions[item.product!.sellerId] = (sellerTransactions[item.product!.sellerId] || 0) + (item.product!.price * item.quantity);
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if (productIndex > -1) updatedProducts[productIndex].stock -= item.quantity;
        }
        updateProductsState(updatedProducts);

        for (const [sellerId, amount] of Object.entries(sellerTransactions)) {
            await addTransaction({ userId: sellerId, type: 'Marketplace', amount, description: `Sale from order ${newOrder.id}`, status: 'Completed' });
            addNotification(sellerId, `You sold items for ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)}!`, 'success');
        }

        updateCartState([]);
        return { success: true, message: 'Checkout successful!' };
    }, [user, cart, products, orders, addTransaction, addNotification]);
    
    const toggleWishlist = useCallback((productId: string) => {
        if (!user) return;
        const newWishlist = user.wishlist.includes(productId) ? user.wishlist.filter(id => id !== productId) : [...user.wishlist, productId];
        updateCurrentUser({ ...user, wishlist: newWishlist });
    }, [user, updateCurrentUser]);

    const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount' | 'status' | 'createdAt'>) => {
        if (!user) return;
        const newProduct: Product = { ...productData, id: `p-${Date.now()}`, sellerId: user.id, sellerName: user.profile.name, reviews: [], rating: 0, reviewCount: 0, status: 'Needs Review', createdAt: new Date().toISOString() };
        updateProductsState([newProduct, ...products]);
        showToast('Product submitted for review!', 'success');
        addNotification('admin-001', `${user.profile.name} has listed a new product for review: ${newProduct.name}.`, 'info');
    }, [user, products, showToast, addNotification]);

    const updateProduct = useCallback(async (productData: Product) => {
        updateProductsState(products.map(p => p.id === productData.id ? {...productData, status: 'Needs Review'} : p));
        showToast('Product updated and resubmitted for review!', 'success');
        addNotification('admin-001', `Product "${productData.name}" was updated and needs review.`, 'info');
    }, [products, showToast, addNotification]);

    const deleteProduct = useCallback(async (productId: string) => {
        showToast("Core data deletion is permanently disabled.", 'warning');
    }, [showToast]);

    const updateProductStatus = useCallback(async (productId: string, status: Product['status']) => {
        const product = products.find(p => p.id === productId);
        if(product) {
            updateProductsState(products.map(p => p.id === productId ? {...p, status} : p));
            addNotification(product.sellerId, `Your product "${product.name}" is now ${status}.`, status === 'Listed' ? 'success' : 'warning');
            showToast('Product status updated.', 'success');
        }
    }, [products, addNotification, showToast]);

    const addMultipleProductsByAdmin = useCallback(async (productsData: any[]): Promise<{ success: number; failed: number; errors: string[] }> => {
        if (!user || user.role !== Role.Admin) { return { success: 0, failed: productsData.length, errors: ["Unauthorized"] }; }
        let success = 0;
        const newProducts: Product[] = productsData.map(prod => {
            success++;
            return {
                id: `p-${Date.now()}-${success}`,
                name: prod.name,
                description: prod.description,
                price: Number(prod.price),
                stock: Number(prod.stock),
                category: prod.category,
                imageUrl: prod.imageUrl || `https://picsum.photos/seed/prod${Date.now()}-${success}/400/400`,
                sellerId: 'admin-001',
                sellerName: 'Koperasi Mitra',
                rating: 0, reviewCount: 0, reviews: [],
                status: 'Listed',
                createdAt: new Date().toISOString(),
            };
        });
        updateProductsState([...newProducts, ...products]);
        return { success, failed: 0, errors: [] };
    }, [user, products]);

    const value: MarketplaceContextType = {
        products, cart, orders, addToCart, removeFromCart, updateCartQuantity,
        checkoutCart, toggleWishlist, addProduct, updateProduct, deleteProduct,
        updateProductStatus, addMultipleProductsByAdmin
    };

    return (
        <MarketplaceContext.Provider value={value}>
            {children}
        </MarketplaceContext.Provider>
    );
};

export const useMarketplace = (): MarketplaceContextType => {
    const context = useContext(MarketplaceContext);
    if (context === undefined) {
        throw new Error('useMarketplace must be used within a MarketplaceProvider');
    }
    return context;
};