const Order = require('../models/Order');
const {
    initiateMoMoPayment,
    verifyMoMoPayment,
    initiateStripePayment,
    verifyStripePayment,
} = require('../utils/payment');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/payments/momo/initiate
 * @desc    Initiate MTN MoMo payment
 * @access  Private/Customer
 */
const initiateMoMo = asyncHandler(async (req, res) => {
    const { orderId, phone } = req.body;

    // Get order
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access denied',
        });
    }

    // Check if payment method is momo
    if (order.paymentMethod !== 'momo') {
        return res.status(400).json({
            success: false,
            message: 'Order payment method is not MoMo',
        });
    }

    // Initiate payment
    const paymentResult = await initiateMoMoPayment(
        order.grandTotal,
        phone,
        order._id.toString()
    );

    // Save transaction ID
    order.momoTransactionId = paymentResult.transactionId;
    await order.save();

    res.json({
        success: true,
        message: 'MoMo payment initiated. Please check your phone to confirm.',
        data: {
            transactionId: paymentResult.transactionId,
            orderId: order._id,
        },
    });
});

/**
 * @route   POST /api/payments/momo/verify
 * @desc    Verify MTN MoMo payment
 * @access  Private/Customer
 */
const verifyMoMo = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    // Get order
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access denied',
        });
    }

    if (!order.momoTransactionId) {
        return res.status(400).json({
            success: false,
            message: 'No MoMo transaction found for this order',
        });
    }

    // Verify payment
    const verificationResult = await verifyMoMoPayment(order.momoTransactionId);

    if (verificationResult.success) {
        order.paymentStatus = 'paid';
        order.orderStatus = 'paid';
        await order.save();

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: { order },
        });
    } else {
        res.json({
            success: false,
            message: 'Payment not completed',
            data: {
                status: verificationResult.status,
            },
        });
    }
});

/**
 * @route   POST /api/payments/stripe/initiate
 * @desc    Initiate Stripe payment
 * @access  Private/Customer
 */
const initiateStripe = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    // Get order
    const order = await Order.findById(orderId).populate('userId', 'email');

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Check if user owns the order
    if (order.userId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access denied',
        });
    }

    // Check if payment method is stripe
    if (order.paymentMethod !== 'stripe') {
        return res.status(400).json({
            success: false,
            message: 'Order payment method is not Stripe',
        });
    }

    // Initiate payment
    const paymentResult = await initiateStripePayment(
        order.grandTotal,
        order._id.toString(),
        order.userId.email
    );

    // Save payment ID
    order.stripePaymentId = paymentResult.paymentIntentId;
    await order.save();

    res.json({
        success: true,
        message: 'Stripe payment initiated',
        data: {
            clientSecret: paymentResult.clientSecret,
            paymentIntentId: paymentResult.paymentIntentId,
            orderId: order._id,
        },
    });
});

/**
 * @route   POST /api/payments/stripe/verify
 * @desc    Verify Stripe payment
 * @access  Private/Customer
 */
const verifyStripe = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    // Get order
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access denied',
        });
    }

    if (!order.stripePaymentId) {
        return res.status(400).json({
            success: false,
            message: 'No Stripe payment found for this order',
        });
    }

    // Verify payment
    const verificationResult = await verifyStripePayment(order.stripePaymentId);

    if (verificationResult.success) {
        order.paymentStatus = 'paid';
        order.orderStatus = 'paid';
        await order.save();

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: { order },
        });
    } else {
        res.json({
            success: false,
            message: 'Payment not completed',
            data: {
                status: verificationResult.status,
            },
        });
    }
});

/**
 * @route   POST /api/payments/stripe/webhook
 * @desc    Stripe webhook handler
 * @access  Public (Stripe webhooks)
 */
const stripeWebhook = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        const order = await Order.findById(orderId);
        if (order) {
            order.paymentStatus = 'paid';
            order.orderStatus = 'paid';
            await order.save();
        }
    }

    res.json({ received: true });
});

/**
 * @route   GET /api/payments/:orderId/status
 * @desc    Get payment status for an order
 * @access  Private/Customer
 */
const getPaymentStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Check if user owns the order or is admin
    const isOwner = order.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Access denied',
        });
    }

    res.json({
        success: true,
        data: {
            orderId: order._id,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            grandTotal: order.grandTotal,
        },
    });
});

module.exports = {
    initiateMoMo,
    verifyMoMo,
    initiateStripe,
    verifyStripe,
    stripeWebhook,
    getPaymentStatus,
};
