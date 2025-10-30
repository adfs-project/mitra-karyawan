import { useCallback } from 'react';
import { Product, CartItem, Order, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

export const useMarketplace = () => {
    const { user, updateCurrentUser } = useAuth();
    const { products, cart, orders, taxConfig, updateState, addTransaction, showToast } = useApp();

    const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'>) => {
        if (!user) return;
        const newProduct: Product = { ...productData, id: `p-${Date.now()}`, sellerId: user.id, sellerName: user.profile.name, reviews: [], rating: 0, reviewCount: 0 };
        updateState('products', [newProduct, ...products]);
        showToast("Product listed successfully!", "success");
    }, [user, products, updateState, showToast]);

    const updateProduct = useCallback(async (product: Product) => {
        updateState('products', products.map(p => p.id === product.id ? product : p));
        showToast("Product updated successfully!", "success");
    }, [products, updateState, showToast]);

    const deleteProduct = useCallback(async (productId: string) => {
        updateState('products', products.filter(p => p.id !== productId));
        showToast("Product deleted successfully.", "success");
    }, [products, updateState, showToast]);
    
    const addMultipleProductsByAdmin = useCallback(async (productsData: any[]): Promise<{ success: number; failed: number; errors: string[] }> => {
        if (!user || user.role !== Role.Admin) {
            return { success: 0, failed: productsData.length, errors: ["Unauthorized"] };
        }
        let success = 0;
        const newProducts: Product[] = [];
        for (const product of productsData) {
            const newProduct: Product = { ...product, id: `p-${Date.now()}-${success}`, sellerId: user.id, sellerName: user.profile.name, reviews: [], rating: 0, reviewCount: 0 };
            newProducts.push(newProduct);
            success++;
        }
        updateState('products', [...newProducts, ...products]);
        return { success, failed: 0, errors: [] };
    }, [user, products, updateState]);

    const addToCart = useCallback((productId: string, quantity: number) => {
        const product = products.find(p => p.id === productId);
        if (!product || product.stock <= 0) {
            showToast("Product is out of stock.", "error");
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
    }, [products, cart, updateState, showToast]);

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

            if (!txResult.success) throw new Error(txResult.message);
            
            const newProducts = [...products];
            cartDetails.forEach(item => {
                const productIndex = newProducts.findIndex(p => p.id === item.productId);
                if (productIndex !== -1) newProducts[productIndex].stock -= item.quantity;
            });
            updateState('products', newProducts);
            updateState('cart', []);
    
            return { success: true, message: "Checkout successful!" };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            showToast(`Checkout failed: ${errorMessage}`, 'error');
            return { success: false, message: errorMessage };
        }
    }, [user, cart, products, taxConfig, addTransaction, updateState, showToast]);
    
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
        addToCart, removeFromCart, updateCartQuantity, clearCart,
        checkoutCart, toggleWishlist,
    };
};
