const express = require('express');
const router = express.Router();
const {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validateObjectId, validatePagination, validateRequired } = require('../middleware/validate');

const requireCustomer = requireRole('customer');

// @route   GET /api/reviews/products/:productId
router.get('/products/:productId', validateObjectId('productId'), validatePagination, getProductReviews);

// @route   POST /api/reviews/products/:productId
router.post(
    '/products/:productId',
    authenticate,
    requireCustomer,
    validateObjectId('productId'),
    validateRequired('rating'),
    createReview
);

// @route   PUT /api/reviews/:id
router.put(
    '/:id',
    authenticate,
    validateObjectId('id'),
    updateReview
);

// @route   DELETE /api/reviews/:id
router.delete('/:id', authenticate, validateObjectId('id'), deleteReview);

module.exports = router;
