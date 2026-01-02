import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaShoppingBag } from 'react-icons/fa';
import Loader from '../components/Loader';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { cartItems, cartTotal, loading, updateQuantity, removeItem } = useCart();
    const [localLoading, setLocalLoading] = useState(false);

    const shippingFee = cartTotal >= 100 ? 0 : 10;
    const grandTotal = cartTotal + shippingFee;

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        setLocalLoading(true);
        await updateQuantity(itemId, newQuantity);
        setLocalLoading(false);
    };

    const handleRemoveItem = async (itemId) => {
        if (window.confirm('Are you sure you want to remove this item?')) {
            setLocalLoading(true);
            await removeItem(itemId);
            setLocalLoading(false);
        }
    };

    const handleCheckout = () => {
        if (isAuthenticated) {
            navigate('/checkout');
        } else {
            navigate('/login');
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="cart-container">
            <div className="cart-wrapper">
                <h1 className="page-title">Shopping Cart</h1>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <FaShoppingBag className="empty-cart-icon" />
                        <h2>Your cart is empty</h2>
                        <p>Add some products to get started!</p>
                        <button className="continue-shopping-btn" onClick={() => navigate('/')}>
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items-section">
                            {cartItems.map((item) => (
                                <div key={item._id} className="cart-item">
                                    <div className="item-image">
                                        <img
                                            src={item.productId?.imageUrl}
                                            alt={item.productId?.name}
                                            onClick={() => navigate(`/products/${item.productId?._id}`)}
                                        />
                                    </div>

                                    <div className="item-details">
                                        <h3
                                            className="item-name"
                                            onClick={() => navigate(`/products/${item.productId?._id}`)}
                                        >
                                            {item.productId?.name}
                                        </h3>
                                        <p className="item-seller">
                                            Sold by: <strong>{item.sellerId?.name}</strong>
                                        </p>
                                        <p className="item-price">{Math.round(item.price).toLocaleString()} Rwf</p>
                                    </div>

                                    <div className="item-actions">
                                        <div className="quantity-control">
                                            <button
                                                onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                disabled={localLoading || item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                disabled={localLoading || item.quantity >= item.productId?.stock}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="item-total">
                                            {Math.round(item.price * item.quantity).toLocaleString()} Rwf
                                        </div>

                                        <button
                                            className="remove-btn"
                                            onClick={() => handleRemoveItem(item._id)}
                                            disabled={localLoading}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary-section">
                            <div className="cart-summary">
                                <h2>Order Summary</h2>

                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <strong>{Math.round(cartTotal).toLocaleString()} Rwf</strong>
                                </div>

                                <div className="summary-row">
                                    <span>Shipping:</span>
                                    <strong>
                                        {shippingFee === 0 ? 'FREE' : `${Math.round(shippingFee).toLocaleString()} Rwf`}
                                    </strong>
                                </div>

                                {shippingFee === 0 && (
                                    <p className="free-shipping-note">
                                        🎉 You qualified for free shipping!
                                    </p>
                                )}

                                {cartTotal < 100 && cartTotal > 0 && (
                                    <p className="shipping-note">
                                        Add {Math.round(100 - cartTotal).toLocaleString()} Rwf more to get free shipping
                                    </p>
                                )}

                                <div className="summary-divider"></div>

                                <div className="summary-row total-row">
                                    <span>Total:</span>
                                    <strong>{Math.round(grandTotal).toLocaleString()} Rwf</strong>
                                </div>

                                <button
                                    className="checkout-btn"
                                    onClick={handleCheckout}
                                    disabled={localLoading}
                                >
                                    {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                                </button>

                                <button
                                    className="continue-shopping-link"
                                    onClick={() => navigate('/')}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
