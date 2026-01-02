const express = require('express');
const router = express.Router();
const {
    getAllSellers,
    getSellerProfile,
    getMySellerProfile,
    updateSellerProfile,
    updateSellerStatus,
    requestSellerUpgrade,
} = require('../controllers/sellerController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireAdmin, requireSeller } = require('../middleware/roleCheck');
const { validateObjectId, validatePagination } = require('../middleware/validate');

// @route   GET /api/sellers
router.get('/', optionalAuth, validatePagination, getAllSellers);

// @route   GET /api/sellers/profile/me
router.get('/profile/me', authenticate, getMySellerProfile);

// @route   PUT /api/sellers/profile
router.put('/profile', authenticate, requireSeller, updateSellerProfile);

// @route   POST /api/sellers/request-upgrade
router.post('/request-upgrade', authenticate, requestSellerUpgrade);

// @route   GET /api/sellers/:id
router.get('/:id', validateObjectId('id'), getSellerProfile);

// @route   PUT /api/sellers/:id/status
router.put('/:id/status', authenticate, requireAdmin, validateObjectId('id'), updateSellerStatus);

module.exports = router;
