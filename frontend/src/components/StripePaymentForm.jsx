import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FaCreditCard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const StripePaymentForm = ({ orderId, onPaymentSuccess, onPaymentError, processing, setProcessing }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        try {
            // 1. Get client secret from backend
            const response = await api.post('/payments/stripe/initiate', { orderId });
            const { clientSecret } = response.data.data;

            // 2. Confirm payment on client side
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (result.error) {
                toast.error(result.error.message);
                onPaymentError(result.error.message);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    // 3. Verify on backend
                    const verifyResponse = await api.post('/payments/stripe/verify', { orderId });
                    if (verifyResponse.data.success) {
                        onPaymentSuccess();
                    } else {
                        onPaymentError('Payment verification failed');
                    }
                }
            }
        } catch (error) {
            console.error('Stripe error:', error);
            const message = error.response?.data?.message || 'Stripe payment failed';
            toast.error(message);
            onPaymentError(message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="stripe-payment-container">
            <div className="card-input-wrapper">
                <div className="card-header">
                    <FaCreditCard className="card-icon" />
                    <span>Secure Credit/Debit Card</span>
                </div>
                <div className="card-element-box">
                    <CardElement options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#2d3748',
                                fontFamily: 'Inter, sans-serif',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#e53e3e',
                            },
                        },
                    }} />
                </div>
            </div>
            <button
                onClick={handleSubmit}
                disabled={processing || !stripe}
                className="place-order-btn card-submit-btn"
            >
                {processing ? (
                    <span className="btn-loading">
                        <span className="spinner-small"></span>
                        Processing Card...
                    </span>
                ) : 'Pay Safely with Card'}
            </button>
            <div className="stripe-security-info">
                <span>🛡️ Secured by Stripe</span>
            </div>
        </div>
    );
};

export default StripePaymentForm;
