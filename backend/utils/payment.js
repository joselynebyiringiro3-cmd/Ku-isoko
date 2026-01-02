const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// MTN MoMo Configuration
const MOMO_BASE_URL = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';
const MOMO_SUBSCRIPTION_KEY = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
const MOMO_API_USER = process.env.MTN_MOMO_API_USER;
const MOMO_API_KEY = process.env.MTN_MOMO_API_KEY;

// Stripe Configuration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Get MoMo Access Token
 */
const getMoMoAccessToken = async () => {
    try {
        const response = await axios.post(
            `${MOMO_BASE_URL}/collection/token/`,
            {},
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
                    Authorization: `Basic ${Buffer.from(`${MOMO_API_USER}:${MOMO_API_KEY}`).toString('base64')}`,
                },
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('MoMo token error:', error.response?.data || error.message);
        throw new Error('Failed to get MoMo access token');
    }
};

/**
 * Initiate MTN MoMo Payment
 * @param {Number} amount - Amount to charge
 * @param {String} phone - Customer phone number (format: 250XXXXXXXXX)
 * @param {String} orderId - Order ID for reference
 * @returns {Object} Payment details with transaction ID
 */
const initiateMoMoPayment = async (amount, phone, orderId) => {
    try {
        const accessToken = await getMoMoAccessToken();
        const referenceId = uuidv4();

        const response = await axios.post(
            `${MOMO_BASE_URL}/collection/v1_0/requesttopay`,
            {
                amount: amount.toString(),
                currency: 'EUR', // Use EUR for sandbox, change to RWF for production (Rwanda)
                externalId: orderId,
                payer: {
                    partyIdType: 'MSISDN',
                    partyId: phone,
                },
                payerMessage: `Payment for order ${orderId}`,
                payeeNote: 'Ku-isoko Order Payment',
            },
            {
                headers: {
                    'X-Reference-Id': referenceId,
                    'X-Target-Environment': 'sandbox', // Change to 'production' for live
                    'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return {
            success: true,
            transactionId: referenceId,
            status: 'pending',
        };
    } catch (error) {
        console.error('MoMo payment error:', error.response?.data || error.message);
        throw new Error('Failed to initiate MoMo payment');
    }
};

/**
 * Verify MTN MoMo Payment
 * @param {String} transactionId - Transaction reference ID
 * @returns {Object} Payment status
 */
const verifyMoMoPayment = async (transactionId) => {
    try {
        const accessToken = await getMoMoAccessToken();

        const response = await axios.get(
            `${MOMO_BASE_URL}/collection/v1_0/requesttopay/${transactionId}`,
            {
                headers: {
                    'X-Target-Environment': 'sandbox',
                    'Ocp-Apim-Subscription-Key': MOMO_SUBSCRIPTION_KEY,
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const status = response.data.status;

        return {
            success: status === 'SUCCESSFUL',
            status: status.toLowerCase(),
            data: response.data,
        };
    } catch (error) {
        console.error('MoMo verify error:', error.response?.data || error.message);
        throw new Error('Failed to verify MoMo payment');
    }
};

/**
 * Initiate Stripe Payment
 * @param {Number} amount - Amount in dollars (will be converted to cents)
 * @param {String} orderId - Order ID for metadata
 * @param {String} email - Customer email
 * @returns {Object} Payment intent with client secret
 */
const initiateStripePayment = async (amount, orderId, email) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // RWF is zero-decimal
            currency: 'rwf',
            metadata: {
                orderId,
            },
            receipt_email: email,
            description: `Order #${orderId} - Ku-isoko`,
        });

        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
        };
    } catch (error) {
        console.error('Stripe payment error:', error.message);
        throw new Error('Failed to initiate Stripe payment');
    }
};

/**
 * Verify Stripe Payment
 * @param {String} paymentIntentId - Payment Intent ID
 * @returns {Object} Payment status
 */
const verifyStripePayment = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        return {
            success: paymentIntent.status === 'succeeded',
            status: paymentIntent.status,
            data: paymentIntent,
        };
    } catch (error) {
        console.error('Stripe verify error:', error.message);
        throw new Error('Failed to verify Stripe payment');
    }
};

/**
 * Create Stripe Checkout Session (alternative method)
 * @param {Number} amount - Amount in dollars
 * @param {String} orderId - Order ID
 * @param {String} successUrl - Success redirect URL
 * @param {String} cancelUrl - Cancel redirect URL
 * @returns {Object} Checkout session
 */
const createStripeCheckoutSession = async (amount, orderId, successUrl, cancelUrl) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'rwf',
                        product_data: {
                            name: `Order #${orderId}`,
                            description: 'Ku-isoko Order',
                        },
                        unit_amount: Math.round(amount),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                orderId,
            },
        });

        return {
            success: true,
            sessionId: session.id,
            url: session.url,
        };
    } catch (error) {
        console.error('Stripe session error:', error.message);
        throw new Error('Failed to create Stripe checkout session');
    }
};

module.exports = {
    initiateMoMoPayment,
    verifyMoMoPayment,
    initiateStripePayment,
    verifyStripePayment,
    createStripeCheckoutSession,
};
