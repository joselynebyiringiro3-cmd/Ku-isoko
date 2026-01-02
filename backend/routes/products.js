const express = require('express');
const router = express.Router();
const {
    createProduct,
    getProducts,
    getProductById,
    getRelatedProducts,
    getMyProducts,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireSeller, requireSellerOrAdmin } = require('../middleware/roleCheck');
const { validateObjectId, validatePagination, validateRequired } = require('../middleware/validate');

// @route   GET /api/products
router.get('/', optionalAuth, validatePagination, getProducts);

// @route   POST /api/products
router.post(
    '/',
    authenticate,
    requireSeller,
    validateRequired('name', 'description', 'price', 'stock', 'category', 'imageUrl'),
    createProduct
);

// @route   GET /api/products/my-products
router.get('/my-products', authenticate, requireSeller, validatePagination, getMyProducts);

// @route   GET /api/products/:id
router.get('/:id', validateObjectId('id'), getProductById);

// @route   GET /api/products/:id/related
router.get('/:id/related', validateObjectId('id'), getRelatedProducts);

// @route   PUT /api/products/:id
router.put(
    '/:id',
    authenticate,
    requireSellerOrAdmin,
    validateObjectId('id'),
    updateProduct
);

// @route   DELETE /api/products/:id
router.delete(
    '/:id',
    authenticate,
    requireSellerOrAdmin,
    validateObjectId('id'),
    deleteProduct
);

module.exports = router;
