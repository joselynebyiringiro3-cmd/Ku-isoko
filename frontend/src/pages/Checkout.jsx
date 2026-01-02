import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaCreditCard, FaMobileAlt, FaCheckCircle, FaLock } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Checkout.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutContent = () => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('momo');
    const [processing, setProcessing] = useState(false);
    const [orderCreated, setOrderCreated] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const shippingFee = cartItems.length > 0 && cartTotal < 50000 ? 2000 : 0;
    const grandTotal = cartTotal + shippingFee;

    const formik = useFormik({
        initialValues: {
            fullName: '',
            phone: '',
            city: '',
            addressLine: '',
            momoPhone: '',
        },
        validationSchema: Yup.object({
            fullName: Yup.string().required('Full name is required'),
            phone: Yup.string().required('Phone number is required'),
            city: Yup.string().required('City is required'),
            addressLine: Yup.string().required('Address is required'),
            momoPhone: paymentMethod === 'momo'
                ? Yup.string().required('Mobile Money phone number is required')
                : Yup.string(),
        }),
        onSubmit: async (values) => {
            await handlePlaceOrder(values);
        },
    });

    const handlePlaceOrder = async (shippingData) => {
        if (processing) return;

        try {
            setProcessing(true);

            let currentOrderId = orderId;

            if (!currentOrderId) {
                // Create order only if we don't have one yet
                const orderResponse = await api.post('/orders', {
                    shippingAddress: {
                        fullName: shippingData.fullName,
                        phone: shippingData.phone,
                        city: shippingData.city,
                        addressLine: shippingData.addressLine,
                    },
                    paymentMethod,
                });

                const createdOrder = orderResponse.data.data.order;
                currentOrderId = createdOrder._id;
                setOrderId(currentOrderId);
            }

            // Initiate payment based on method
            if (paymentMethod === 'momo') {
                await handleMoMoPayment(currentOrderId, shippingData.momoPhone);
            } else if (paymentMethod === 'stripe') {
                await handleStripeProcess(currentOrderId);
            }

        } catch (error) {
            console.error('Checkout Error:', error);
            const message = error.response?.data?.message || 'Failed to place order';
            toast.error(message);
            setProcessing(false);
        }
    };

    const handleMoMoPayment = async (orderId, phone) => {
        try {
            // Initiate MoMo payment
            const response = await api.post('/payments/momo/initiate', {
                orderId,
                phone,
            });

            toast.success('Payment request sent to your phone. Please confirm to complete the order.');

            // In production, you would poll for payment status
            // For now, we'll simulate a delay and then verify
            setTimeout(async () => {
                try {
                    const verifyResponse = await api.post('/payments/momo/verify', { orderId });

                    if (verifyResponse.data.success) {
                        setOrderCreated(true);
                        await clearCart();
                        toast.success('Payment successful! Order placed.');
                    } else {
                        toast.warning('Payment is pending. Please check your order history.');
                        navigate('/orders');
                    }
                } catch (error) {
                    toast.error('Payment verification failed. Please check your order status.');
                    navigate('/orders');
                } finally {
                    setProcessing(false);
                }
            }, 5000);

        } catch (error) {
            setProcessing(false);
            throw error;
        }
    };

    const handleStripeProcess = async (orderId) => {
        try {
            if (!stripe || !elements) {
                toast.error('Stripe has not loaded. Please refresh the page.');
                return;
            }

            // 1. Get client secret
            const response = await api.post('/payments/stripe/initiate', { orderId });
            const { clientSecret } = response.data.data;

            // 2. Confirm payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (result.error) {
                toast.error(result.error.message);
                // Note: The order remains in 'pending' status in DB
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // 3. Verify on backend
                    const verifyResponse = await api.post('/payments/stripe/verify', { orderId });
                    if (verifyResponse.data.success) {
                        setOrderCreated(true);
                        await clearCart();
                        toast.success('Payment successful! Order placed.');
                    }
                }
            }
        } catch (error) {
            console.error('Stripe error:', error);
            toast.error('Credit card payment failed. Please try again or use MoMo.');
        } finally {
            setProcessing(false);
        }
    };

    if (cartItems.length === 0 && !orderCreated) {
        return (
            <div className="checkout-container">
                <div className="empty-checkout">
                    <h2>Your cart is empty</h2>
                    <button onClick={() => navigate('/')}>Continue Shopping</button>
                </div>
            </div>
        );
    }

    if (orderCreated) {
        return (
            <div className="checkout-container">
                <div className="order-success">
                    <FaCheckCircle className="success-icon" />
                    <h1>Order Placed Successfully!</h1>
                    <p>Thank you for your purchase. Your order ID is:</p>
                    <div className="order-id">{orderId}</div>
                    <p>You will receive a confirmation email shortly.</p>
                    <div className="success-actions">
                        <button className="view-orders-btn" onClick={() => navigate('/orders')}>
                            View My Orders
                        </button>
                        <button className="continue-shopping-btn" onClick={() => navigate('/')}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-wrapper">
                <h1 className="page-title">Checkout</h1>

                <div className="checkout-content">
                    <div className="checkout-form-section">
                        <form onSubmit={formik.handleSubmit}>
                            {/* Shipping Information */}
                            <div className="form-section">
                                <h2>Shipping Information</h2>

                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name *</label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        {...formik.getFieldProps('fullName')}
                                        className={formik.touched.fullName && formik.errors.fullName ? 'error' : ''}
                                    />
                                    {formik.touched.fullName && formik.errors.fullName && (
                                        <div className="error-message">{formik.errors.fullName}</div>
                                    )}
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="phone">Phone Number *</label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            {...formik.getFieldProps('phone')}
                                            className={formik.touched.phone && formik.errors.phone ? 'error' : ''}
                                        />
                                        {formik.touched.phone && formik.errors.phone && (
                                            <div className="error-message">{formik.errors.phone}</div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="city">City *</label>
                                        <input
                                            id="city"
                                            type="text"
                                            {...formik.getFieldProps('city')}
                                            className={formik.touched.city && formik.errors.city ? 'error' : ''}
                                        />
                                        {formik.touched.city && formik.errors.city && (
                                            <div className="error-message">{formik.errors.city}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="addressLine">Street Address *</label>
                                    <textarea
                                        id="addressLine"
                                        rows="3"
                                        {...formik.getFieldProps('addressLine')}
                                        className={formik.touched.addressLine && formik.errors.addressLine ? 'error' : ''}
                                    />
                                    {formik.touched.addressLine && formik.errors.addressLine && (
                                        <div className="error-message">{formik.errors.addressLine}</div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="form-section">
                                <h2>Payment Method</h2>

                                <div className="payment-methods">
                                    <div
                                        className={`payment-option ${paymentMethod === 'momo' ? 'active' : ''}`}
                                        onClick={() => setPaymentMethod('momo')}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="momo"
                                            checked={paymentMethod === 'momo'}
                                            onChange={() => { }}
                                        />
                                        <img src="/images/mtn-momo.png" alt="MTN MoMo" className="payment-logo" />
                                        <span>Mobile Money</span>
                                    </div>

                                    <div
                                        className={`payment-option ${paymentMethod === 'stripe' ? 'active' : ''}`}
                                        onClick={() => setPaymentMethod('stripe')}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="stripe"
                                            checked={paymentMethod === 'stripe'}
                                            onChange={() => { }}
                                        />
                                        <div className="card-icons">
                                            <FaCreditCard className="payment-icon" />
                                        </div>
                                        <span>Credit/Debit Card</span>
                                    </div>
                                </div>

                                {paymentMethod === 'momo' && (
                                    <div className="form-group momo-input-section">
                                        <label htmlFor="momoPhone">Mobile Money Phone Number *</label>
                                        <input
                                            id="momoPhone"
                                            type="tel"
                                            placeholder="+250 78/79X XXX XXX"
                                            {...formik.getFieldProps('momoPhone')}
                                            className={formik.touched.momoPhone && formik.errors.momoPhone ? 'error' : ''}
                                        />
                                        {formik.touched.momoPhone && formik.errors.momoPhone && (
                                            <div className="error-message">{formik.errors.momoPhone}</div>
                                        )}
                                        <small className="form-hint">
                                            Please enter your Rwanda MTN Mobile Money number (+250)
                                        </small>
                                    </div>
                                )}

                                {paymentMethod === 'stripe' && (
                                    <div className="stripe-inline-container">
                                        <div className="stripe-card-wrapper">
                                            <div className="stripe-card-header">
                                                <FaLock className="secure-icon" />
                                                <span>Secure Card Payment</span>
                                            </div>
                                            <div className="stripe-card-body">
                                                <CardElement options={{
                                                    style: {
                                                        base: {
                                                            fontSize: '16px',
                                                            color: '#2d3748',
                                                            fontFamily: 'Inter, sans-serif',
                                                            '::placeholder': { color: '#aab7c4' },
                                                        },
                                                        invalid: { color: '#e53e3e' },
                                                    },
                                                }} />
                                            </div>
                                        </div>
                                        <p className="stripe-notice">🛡️ Your card details are encrypted and never stored on our servers.</p>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="place-order-btn"
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="loading-content">
                                        <span className="spinner"></span>
                                        Processing...
                                    </div>
                                ) : (paymentMethod === 'momo' ? 'Place Order via MoMo' : 'Pay with Credit Card')}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary-section">
                        <div className="order-summary">
                            <h2>Order Summary</h2>

                            <div className="summary-items">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="summary-item">
                                        <img src={item.productId?.imageUrl} alt={item.productId?.name} />
                                        <div className="summary-item-details">
                                            <p className="summary-item-name">{item.productId?.name}</p>
                                            <p className="summary-item-qty">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="summary-item-price">
                                            {Math.round(item.price * item.quantity).toLocaleString()} Rwf
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <strong>{Math.round(cartTotal).toLocaleString()} Rwf</strong>
                            </div>

                            <div className="summary-row">
                                <span>Shipping:</span>
                                <strong>{shippingFee === 0 ? 'FREE' : `${Math.round(shippingFee).toLocaleString()} Rwf`}</strong>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row total-row">
                                <span>Total:</span>
                                <strong>{Math.round(grandTotal).toLocaleString()} Rwf</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Checkout = () => (
    <Elements stripe={stripePromise}>
        <CheckoutContent />
    </Elements>
);

export default Checkout;
