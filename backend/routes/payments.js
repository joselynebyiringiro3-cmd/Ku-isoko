const express = require('express');
const router = express.Router();
const {
    initiateMoMo,
    verifyMoMo,
    initiateStripe,
    verifyStripe,
    stripeWebhook,
    getPaymentStatus,
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validateRequired } = require('../middleware/validate');

const requireCustomer = requireRole('customer');

// @route   POST /api/payments/momo/initiate
router.post(
    '/momo/initiate',
    authenticate,
    requireCustomer,
    validateRequired('orderId', 'phone'),
    initiateMoMo
);

// @route   POST /api/payments/momo/verify
router.post(
    '/momo/verify',
    authenticate,
    requireCustomer,
    validateRequired('orderId'),
    verifyMoMo
);

// @route   POST /api/payments/stripe/initiate
router.post(
    '/stripe/initiate',
    authenticate,
    requireCustomer,
    validateRequired('orderId'),
    initiateStripe
);

// @route   POST /api/payments/stripe/verify
router.post(
    '/stripe/verify',
    authenticate,
    requireCustomer,
    validateRequired('orderId'),
    verifyStripe
);

// @route   POST /api/payments/stripe/webhook (Stripe webhooks don't need auth)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// @route   GET /api/payments/:orderId/status
router.get('/:orderId/status', authenticate, getPaymentStatus);

module.exports = router;
