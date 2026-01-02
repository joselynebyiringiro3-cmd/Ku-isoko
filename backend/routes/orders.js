const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getSellerOrders,
    getAllOrders,
    updateOrderStatus,
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requireAdmin, requireSeller } = require('../middleware/roleCheck');
const { validateObjectId, validatePagination, validateRequired } = require('../middleware/validate');

const requireCustomer = requireRole('customer');

// @route   POST /api/orders
router.post(
    '/',
    authenticate,
    requireCustomer,
    validateRequired('shippingAddress', 'paymentMethod'),
    createOrder
);

// @route   GET /api/orders/my-orders
router.get('/my-orders', authenticate, requireCustomer, validatePagination, getMyOrders);

// @route   GET /api/orders/seller-orders
router.get('/seller-orders', authenticate, requireSeller, validatePagination, getSellerOrders);

// @route   GET /api/orders (admin)
router.get('/', authenticate, requireAdmin, validatePagination, getAllOrders);

// @route   GET /api/orders/:id
router.get('/:id', authenticate, validateObjectId('id'), getOrderById);

// @route   PUT /api/orders/:id/status
router.put('/:id/status', authenticate, requireAdmin, validateObjectId('id'), updateOrderStatus);

module.exports = router;
