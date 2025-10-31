import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { Product, Role, CartItem, Order } from '../types';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';

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

// FIX: Export the context so it can be imported by hooks.
export const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, updateCurrentUser } = useAuth();
    const { products, cart, orders, updateState, addTransaction, showToast, addNotification } = useApp();

    const addToCart = useCallback((productId: string, quantity: number) => {
        if (!user) {
            showToast('You must be logged in to add items to the cart.', 'error');
            return;
        }
        const product = products.find(p => p.id === productId);
        if (!product) {
            showToast('Product not found.', 'error');
            return;
        }
        if (product.stock < quantity) {
            showToast('Not enough stock available.', 'warning');
            return;
        }
        
        const existingItem = cart.find(item => item.productId === productId);
        let newCart;
        if (existingItem) {
            newCart = cart.map(item => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item);
        } else {
            newCart = [...cart, { productId, quantity }];
        }
        updateState('cart', newCart);
        showToast(`${product.name} added to cart.`, 'success');
    }, [user, products, cart, updateState, showToast]);

    const removeFromCart = useCallback((productId: string) => {
        updateState('cart', cart.filter(item => item.productId !== productId));
        showToast('Item removed from cart.', 'info');
    }, [cart, updateState, showToast]);

    const updateCartQuantity = useCallback((productId: string, quantity: number) => {
        const product = products.find(p => p.id === productId);
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        if (product && quantity > product.stock) {
            showToast(`Only ${product.stock} items in stock.`, 'warning');
            updateState('cart', cart.map(item => item.productId === productId ? { ...item, quantity: product.stock } : item));
            return;
        }
        updateState('cart', cart.map(item => item.productId === productId ? { ...item, quantity } : item));
    }, [products, cart, updateState, removeFromCart, showToast]);

    const checkoutCart = useCallback(async (): Promise<{ success: boolean; message: string }> => {
        if (!user) return { success: false, message: 'User not logged in.' };
        
        const cartDetails = cart.map(item => ({...item, product: products.find(p => p.id === item.productId)})).filter(item => item.product);
        const subtotal = cartDetails.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0);

        if (subtotal <= 0) return { success: false, message: 'Cart is empty.' };

        // Transaction for buyer
        const txResult = await addTransaction({
            userId: user.id,
            type: 'Marketplace',
            amount: -subtotal,
            description: `Purchase of ${cartDetails.length} items from Marketplace`,
            status: 'Completed',
        });

        if (!txResult.success) return txResult;

        // Create order
        const newOrder: Order = {
            id: `ord-${Date.now()}`,
            userId: user.id,
            items: cartDetails.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product!.price,
                productName: item.product!.name
            })),
            total: subtotal,
            timestamp: new Date().toISOString()
        };
        updateState('orders', [...orders, newOrder]);

        // Transaction and notification for sellers
        const sellerTransactions: Record<string, number> = {};
        const updatedProducts = [...products];

        for (const item of cartDetails) {
            const sellerId = item.product!.sellerId;
            const saleAmount = item.product!.price * item.quantity;
            sellerTransactions[sellerId] = (sellerTransactions[sellerId] || 0) + saleAmount;

            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if (productIndex > -1) {
                updatedProducts[productIndex].stock -= item.quantity;
            }
        }
        
        updateState('products', updatedProducts);

        for (const [sellerId, amount] of Object.entries(sellerTransactions)) {
            await addTransaction({
                userId: sellerId,
                type: 'Marketplace',
                amount: amount,
                description: `Sale of items from order ${newOrder.id}`,
                status: 'Completed'
            });
            addNotification(sellerId, `You've sold items totaling ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)}!`, 'success');
        }

        updateState('cart', []);
        
        return { success: true, message: 'Checkout successful!' };
    }, [user, cart, products, orders, addTransaction, updateState, addNotification]);
    
    const toggleWishlist = useCallback((productId: string) => {
        if (!user) return;
        const newWishlist = user.wishlist.includes(productId) ? user.wishlist.filter(id => id !== productId) : [...user.wishlist, productId];
        updateCurrentUser({ ...user, wishlist: newWishlist });
    }, [user, updateCurrentUser]);

    const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount' | 'status' | 'createdAt'>) => {
        if (!user) return;
        const newProduct: Product = {
            ...productData,
            id: `p-${Date.now()}`,
            sellerId: user.id,
            sellerName: user.profile.name,
            reviews: [],
            rating: 0,
            reviewCount: 0,
            status: 'Listed',
            createdAt: new Date().toISOString()
        };
        updateState('products', [newProduct, ...products]);
        showToast('Product listed successfully!', 'success');
    }, [user, products, updateState, showToast]);

    const updateProduct = useCallback(async (productData: Product) => {
        updateState('products', products.map(p => p.id === productData.id ? productData : p));
        showToast('Product updated successfully!', 'success');
    }, [products, updateState, showToast]);

    const deleteProduct = useCallback(async (productId: string) => {
        showToast("Core data deletion is permanently disabled.", 'warning');
    }, [showToast]);

    const updateProductStatus = useCallback(async (productId: string, status: Product['status']) => {
        updateState('products', products.map(p => p.id === productId ? {...p, status} : p));
        showToast('Product status updated.', 'success');
    }, [products, updateState, showToast]);

    const addMultipleProductsByAdmin = useCallback(async (productsData: any[]): Promise<{ success: number; failed: number; errors: string[] }> => {
        if (!user || user.role !== Role.Admin) {
            return { success: 0, failed: productsData.length, errors: ["Unauthorized"] };
        }
        let success = 0;
        const newProducts: Product[] = [];
        for(const prod of productsData) {
            newProducts.push({
                id: `p-${Date.now()}-${success}`,
                name: prod.name,
                description: prod.description,
                price: Number(prod.price),
                stock: Number(prod.stock),
                category: prod.category,
                imageUrl: prod.imageUrl || `https://picsum.photos/seed/prod${Date.now()}-${success}/400/400`,
                sellerId: 'admin-001',
                sellerName: 'Koperasi Mitra',
                rating: 0,
                reviewCount: 0,
                reviews: [],
                status: 'Listed',
                createdAt: new Date().toISOString(),
            });
            success++;
        }
        updateState('products', [...newProducts, ...products]);
        return { success, failed: 0, errors: [] };
    }, [user, products, updateState]);

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
