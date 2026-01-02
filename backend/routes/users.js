const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUserRole,
    toggleUserActive,
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { validateObjectId, validatePagination } = require('../middleware/validate');

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

// @route   GET /api/users
router.get('/', validatePagination, getAllUsers);

// @route   GET /api/users/:id
router.get('/:id', validateObjectId('id'), getUserById);

// @route   PUT /api/users/:id/role
router.put('/:id/role', validateObjectId('id'), updateUserRole);

// @route   PUT /api/users/:id/toggle-active
router.put('/:id/toggle-active', validateObjectId('id'), toggleUserActive);

module.exports = router;
