import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // Initial load and sync on login
    useEffect(() => {
        if (isAuthenticated && user?.role === 'customer') {
            syncGuestCart().then(() => fetchCart());
        } else if (!isAuthenticated) {
            fetchLocalCart();
        }
    }, [isAuthenticated, user]);

    // Sync guest cart to backend after login
    const syncGuestCart = async () => {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        if (guestCart.length > 0) {
            setLoading(true);
            try {
                // Add items sequentially
                for (const item of guestCart) {
                    // Check if item has valid product ID
                    const pId = item.productId?._id || item.productId;
                    if (pId) {
                        await api.post('/cart', {
                            productId: pId,
                            quantity: item.quantity
                        });
                    }
                }
                localStorage.removeItem('guestCart');
                toast.info('Your guest cart has been merged with your account.');
            } catch (error) {
                console.error('Failed to sync guest cart:', error);
                // Don't remove from LS if failed? Or remove partial?
                // For now, keep it simple.
            } finally {
                setLoading(false);
            }
        }
    };

    const fetchLocalCart = () => {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCartItems(guestCart);
        setCartCount(guestCart.length);

        const total = guestCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setCartTotal(total);
    };

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cart');
            const { cart, total } = response.data.data;

            setCartItems(cart.items || []);
            setCartCount(cart.items?.length || 0);
            setCartTotal(total || 0);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1, productDetails = null) => {
        if (isAuthenticated && user?.role === 'customer') {
            // Backend Cart
            try {
                const response = await api.post('/cart', { productId, quantity });
                const { cart, total } = response.data.data;

                setCartItems(cart.items);
                setCartCount(cart.items.length);
                setCartTotal(total);

                toast.success('Added to cart!');
                return { success: true };
            } catch (error) {
                return { success: false, error: error.response?.data?.message || 'Failed to add to cart' };
            }
        } else {
            // Guest Cart (Local Storage)
            if (!productDetails) {
                return { success: false, error: 'Product details missing for guest cart' };
            }

            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            const existingItemIndex = guestCart.findIndex(item => item.productId._id === productId);

            if (existingItemIndex > -1) {
                guestCart[existingItemIndex].quantity += quantity;
            } else {
                guestCart.push({
                    _id: `local_${Date.now()}`,
                    productId: productDetails, // Store full product object
                    quantity,
                    price: productDetails.price,
                    sellerId: productDetails.sellerId
                });
            }

            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            fetchLocalCart(); // Update state
            toast.success('Added to cart!');
            return { success: true };
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        if (isAuthenticated && user?.role === 'customer') {
            try {
                const response = await api.put(`/cart/${itemId}`, { quantity });
                const { cart, total } = response.data.data;

                setCartItems(cart.items);
                setCartCount(cart.items.length);
                setCartTotal(total);

                return { success: true };
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to update cart');
                return { success: false };
            }
        } else {
            // Local Cart
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            const itemIndex = guestCart.findIndex(item => item._id === itemId);

            if (itemIndex > -1) {
                if (quantity <= 0) {
                    guestCart.splice(itemIndex, 1);
                } else {
                    guestCart[itemIndex].quantity = quantity;
                }
                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                fetchLocalCart();
                return { success: true };
            }
            return { success: false };
        }
    };

    const removeItem = async (itemId) => {
        if (isAuthenticated && user?.role === 'customer') {
            try {
                const response = await api.delete(`/cart/${itemId}`);
                const { cart, total } = response.data.data;

                setCartItems(cart.items);
                setCartCount(cart.items.length);
                setCartTotal(total);

                toast.success('Item removed from cart');
                return { success: true };
            } catch (error) {
                toast.error('Failed to remove item');
                return { success: false };
            }
        } else {
            // Local Cart
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            const newCart = guestCart.filter(item => item._id !== itemId);

            localStorage.setItem('guestCart', JSON.stringify(newCart));
            fetchLocalCart();
            toast.success('Item removed from cart');
            return { success: true };
        }
    };

    const clearCart = async () => {
        if (isAuthenticated && user?.role === 'customer') {
            try {
                await api.delete('/cart');
                setCartItems([]);
                setCartCount(0);
                setCartTotal(0);
                return { success: true };
            } catch (error) {
                return { success: false };
            }
        } else {
            localStorage.removeItem('guestCart');
            fetchLocalCart();
            return { success: true };
        }
    };

    const value = {
        cartItems,
        cartCount,
        cartTotal,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
