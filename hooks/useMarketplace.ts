import { useCallback } from 'react';
import { Product, CartItem, Order, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { GoogleGenAI } from "@google/genai";
import { buildSecurePrompt } from '../services/aiGuardrailService';
// FIX: Import vaultService to find the admin user for notifications.
import vaultService from '../services/vaultService';

export const useMarketplace = () => {
    const { user, updateCurrentUser } = useAuth();
    const { products, cart, orders, taxConfig, updateState, addTransaction, showToast, addNotification } = useApp();

    const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount' | 'status' | 'createdAt'>) => {
        if (!user) return;

        const moderationPrompt = buildSecurePrompt(
            `${productData.name} - ${productData.description}`,
            `Your ONLY function is to act as a content moderator for a P2P marketplace. Analyze the following product title and description. Determine if it violates policies (e.g., illegal items, weapons, drugs, offensive language, spam). Respond with ONLY "CLEAN" if it's safe, or "NEEDS_REVIEW" if it might violate policy.`
        );
        
        let status: Product['status'] = 'Listed';
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: moderationPrompt,
            });
            const moderationResult = response.text.trim();
            if (moderationResult === 'NEEDS_REVIEW') {
                status = 'Needs Review';
                const adminUser = (vaultService.getSanitizedData()).users.find(u => u.role === Role.Admin);
                if(adminUser) {
                    addNotification(adminUser.id, `Produk baru "${productData.name}" membutuhkan tinjauan moderasi.`, 'warning');
                }
            }
        } catch (error) {
            console.error("AI Moderation failed, defaulting to Needs Review:", error);
            status = 'Needs Review'; // Default to manual review if AI fails
        }

        const newProduct: Product = { 
            ...productData, 
            id: `p-${Date.now()}`, 
            sellerId: user.id, 
            sellerName: user.profile.name, 
            reviews: [], 
            rating: 0, 
            reviewCount: 0,
            status,
            isFeatured: false,
            createdAt: new Date().toISOString(),
        };
        updateState('products', [newProduct, ...products]);
        showToast("Product listed successfully!", "success");
    }, [user, products, updateState, showToast, addNotification]);

    const updateProduct = useCallback(async (product: Product) => {
        updateState('products', products.map(p => p.id === product.id ? product : p));
        showToast("Product updated successfully!", "success");
    }, [products, updateState, showToast]);

    const deleteProduct = useCallback(async (productId: string) => {
        showToast("Core data deletion is permanently disabled.", 'warning');
    }, [showToast]);
    
    const addMultipleProductsByAdmin = useCallback(async (productsData: any[]): Promise<{ success: number; failed: number; errors: string[] }> => {
        if (!user || user.role !== Role.Admin) {
            return { success: 0, failed: productsData.length, errors: ["Unauthorized"] };
        }
        let success = 0;
        const newProducts: Product[] = [];
        for (const product of productsData) {
            const newProduct: Product = { 
                ...product, 
                id: `p-${Date.now()}-${success}`, 
                sellerId: user.id, 
                sellerName: 'Koperasi Mitra', 
                reviews: [], 
                rating: 0, 
                reviewCount: 0,
                status: 'Listed',
                createdAt: new Date().toISOString()
            };
            newProducts.push(newProduct);
            success++;
        }
        updateState('products', [...newProducts, ...products]);
        return { success, failed: 0, errors: [] };
    }, [user, products, updateState]);
    
    const moderateProduct = useCallback(async (productId: string, newStatus: 'Listed' | 'Unlisted') => {
        updateState('products', products.map(p => p.id === productId ? { ...p, status: newStatus } : p));
        showToast(`Product status updated to ${newStatus}.`, 'success');
    }, [products, updateState, showToast]);
    
    const toggleFeaturedProduct = useCallback(async (productId: string) => {
        updateState('products', products.map(p => p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p));
    }, [products, updateState]);


    const addToCart = useCallback((productId: string, quantity: number) => {
        const product = products.find(p => p.id === productId);
        if (!product || product.stock <= 0 || product.status !== 'Listed') {
            showToast("Product is unavailable or out of stock.", "error");
            return;
        }
        if (product.sellerId === user?.id) {
            showToast("You cannot buy your own product.", "warning");
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
        showToast("Item added to cart", "success");
    }, [products, cart, updateState, showToast, user]);

    const removeFromCart = useCallback((productId: string) => {
        updateState('cart', cart.filter(item => item.productId !== productId));
    }, [cart, updateState]);

    const updateCartQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        updateState('cart', cart.map(item => item.productId === productId ? { ...item, quantity } : item));
    }, [cart, updateState, removeFromCart]);

    const clearCart = useCallback(() => updateState('cart', []), [updateState]);

    const checkoutCart = useCallback(async (): Promise<{ success: boolean; message: string; }> => {
        if (!user || cart.length === 0) return { success: false, message: "Your cart is empty." };
        
        try {
            const cartDetails = cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) throw new Error(`Product with ID ${item.productId} not found.`);
                if (item.quantity > product.stock) throw new Error(`Not enough stock for ${product.name}.`);
                return { ...item, product };
            });
    
            const subtotal = cartDetails.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            
            const newOrder: Order = {
                id: `ord-${Date.now()}`,
                userId: user.id,
                items: cartDetails.map(item => ({
                    productId: item.productId,
                    productName: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
                total: subtotal,
                timestamp: new Date().toISOString(),
            };

            const txResult = await addTransaction({
                userId: user.id,
                type: 'Marketplace',
                amount: -subtotal,
                description: `Purchase of ${cartDetails.length} items (Order #${newOrder.id})`,
                status: 'Completed',
                relatedId: newOrder.id
            });

            if (!txResult.success) throw new Error(txResult.message);
            
            const newProducts = [...products];
            cartDetails.forEach(item => {
                const productIndex = newProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) newProducts[productIndex].stock -= item.quantity;
            });
            updateState('products', newProducts);
            updateState('orders', [...orders, newOrder]);
            updateState('cart', []);
    
            return { success: true, message: "Checkout successful!" };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            showToast(`Checkout failed: ${errorMessage}`, 'error');
            return { success: false, message: errorMessage };
        }
    }, [user, cart, products, orders, addTransaction, updateState, showToast]);
    
    const toggleWishlist = useCallback((productId: string) => {
        if (!user) return;
        const newWishlist = user.wishlist.includes(productId)
            ? user.wishlist.filter(id => id !== productId)
            : [...user.wishlist, productId];
        updateCurrentUser({ ...user, wishlist: newWishlist });
    }, [user, updateCurrentUser]);

    return {
        products, cart, orders,
        addProduct, updateProduct, deleteProduct, addMultipleProductsByAdmin,
        moderateProduct, toggleFeaturedProduct,
        addToCart, removeFromCart, updateCartQuantity, clearCart,
        checkoutCart, toggleWishlist,
    };
};