const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validateObjectId, validateRequired } = require('../middleware/validate');

// All cart routes require customer authentication
const requireCustomer = requireRole('customer');

// @route   GET /api/cart
router.get('/', authenticate, requireCustomer, getCart);

// @route   POST /api/cart
router.post(
    '/',
    authenticate,
    requireCustomer,
    validateRequired('productId'),
    addToCart
);

// @route   PUT /api/cart/:itemId
router.put(
    '/:itemId',
    authenticate,
    requireCustomer,
    validateRequired('quantity'),
    updateCartItem
);

// @route   DELETE /api/cart/:itemId
router.delete('/:itemId', authenticate, requireCustomer, removeFromCart);

// @route   DELETE /api/cart (clear cart)
router.delete('/', authenticate, requireCustomer, clearCart);

module.exports = router;
