import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Product, CartItem, Order, Role } from '../types';
import vaultService from '../services/vaultService';
import { useAuth } from './AuthContext';
import { useCore } from './DataContext';
import { useApp } from './AppContext';

type MarketplaceData = {
    products: Product[];
    cart: CartItem[];
    orders: Order[];
}

interface MarketplaceContextType {
    products: Product[];
    cart: CartItem[];
    orders: Order[];

    addProduct: (product: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    addMultipleProductsByAdmin: (productsData: any[]) => Promise<{ success: number; failed: number; errors: string[] }>;
    addToCart: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    checkoutCart: () => Promise<{ success: boolean; message: string; }>;
    toggleWishlist: (productId: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- Dependencies from other contexts ---
    const { user, updateCurrentUser } = useAuth();
    const { addTransaction, taxConfig } = useCore();
    const { showToast } = useApp();

    // --- State managed by this context ---
    const [marketplaceData, setMarketplaceData] = useState({
        products: vaultService.getSanitizedData().products,
        cart: vaultService.getSanitizedData().cart,
        orders: vaultService.getSanitizedData().orders,
    });

    // Helper to update both vault and local state
    const updateState = <K extends keyof MarketplaceData>(key: K, value: MarketplaceData[K]) => {
        vaultService.setData(key, value as any);
        setMarketplaceData(prev => ({...prev, [key]: value}));
    };

    // --- Marketplace Functions ---

    const addProduct = async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'>) => {
        if (!user) return;
        const newProduct: Product = { ...productData, id: `p-${Date.now()}`, sellerId: user.id, sellerName: user.profile.name, reviews: [], rating: 0, reviewCount: 0 };
        updateState('products', [newProduct, ...marketplaceData.products]);
        showToast("Product listed successfully!", "success");
    };

    const updateProduct = async (product: Product) => {
        updateState('products', marketplaceData.products.map(p => p.id === product.id ? product : p));
        showToast("Product updated successfully!", "success");
    };

    const deleteProduct = async (productId: string) => {
        updateState('products', marketplaceData.products.filter(p => p.id !== productId));
        showToast("Product deleted successfully.", "success");
    };
    
    const addMultipleProductsByAdmin = async (productsData: any[]): Promise<{ success: number; failed: number; errors: string[] }> => {
        if (!user || user.role !== Role.Admin) {
            return { success: 0, failed: productsData.length, errors: ["Unauthorized"] };
        }
        let success = 0;
        const newProducts: Product[] = [];
        for(const product of productsData) {
             const newProduct: Product = { 
                ...product, 
                id: `p-${Date.now()}-${success}`, 
                sellerId: user.id, 
                sellerName: user.profile.name, 
                reviews: [], 
                rating: 0, 
                reviewCount: 0 
            };
            newProducts.push(newProduct);
            success++;
        }
        updateState('products', [...newProducts, ...marketplaceData.products]);
        return { success, failed: 0, errors: [] };
    };

    const addToCart = (productId: string, quantity: number) => {
        const product = marketplaceData.products.find(p => p.id === productId);
        if (!product || product.stock <= 0) {
            showToast("Product is out of stock.", "error");
            return;
        }
        const existingItem = marketplaceData.cart.find(item => item.productId === productId);
        let newCart;
        if (existingItem) {
            newCart = marketplaceData.cart.map(item => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item);
        } else {
            newCart = [...marketplaceData.cart, { productId, quantity }];
        }
        updateState('cart', newCart);
        showToast("Item added to cart", "success");
    };

    const removeFromCart = (productId: string) => {
        updateState('cart', marketplaceData.cart.filter(item => item.productId !== productId));
    };

    const updateCartQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        updateState('cart', marketplaceData.cart.map(item => item.productId === productId ? { ...item, quantity } : item));
    };

    const clearCart = () => updateState('cart', []);

    const checkoutCart = async (): Promise<{ success: boolean; message: string; }> => {
        if (!user || marketplaceData.cart.length === 0) return { success: false, message: "Your cart is empty." };
    
        try {
            const cartDetails = marketplaceData.cart.map(item => {
                const product = marketplaceData.products.find(p => p.id === item.productId);
                if (!product) throw new Error(`Product with ID ${item.productId} not found.`);
                return { ...item, product };
            });
    
            const subtotal = cartDetails.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            const totalPPN = subtotal * taxConfig.ppnRate;
            const totalPayable = subtotal + totalPPN;
            
            const txResult = await addTransaction({
                userId: user.id,
                type: 'Marketplace',
                amount: -totalPayable,
                description: `Purchase of ${cartDetails.length} items from Marketplace`,
                status: 'Completed'
            });

            if (!txResult.success) {
                throw new Error(txResult.message);
            }
            
            const newProducts = [...marketplaceData.products];
            cartDetails.forEach(item => {
                const productIndex = newProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) {
                    newProducts[productIndex].stock -= item.quantity;
                }
            });
            updateState('products', newProducts);
            updateState('cart', []);
    
            return { success: true, message: "Checkout successful!" };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            showToast(`Checkout failed: ${errorMessage}`, 'error');
            return { success: false, message: errorMessage };
        }
    };
    
    const toggleWishlist = (productId: string) => {
        if (!user) return;
        const newWishlist = user.wishlist.includes(productId)
            ? user.wishlist.filter(id => id !== productId)
            : [...user.wishlist, productId];
        updateCurrentUser({ ...user, wishlist: newWishlist });
    };

    const value: MarketplaceContextType = {
        products: marketplaceData.products,
        cart: marketplaceData.cart,
        orders: marketplaceData.orders,
        addProduct,
        updateProduct,
        deleteProduct,
        addMultipleProductsByAdmin,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkoutCart,
        toggleWishlist,
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