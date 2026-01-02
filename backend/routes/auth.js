const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const {
    signup,
    login,
    googleAuthCallback,
    forgotPassword,
    verifyOTP,
    resetPassword,
    resendOTP,
    getMe,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateEmail, validatePassword, validateRequired } = require('../middleware/validate');

// @route   POST /api/auth/signup
router.post(
    '/signup',
    validateEmail,
    validatePassword,
    validateRequired('name', 'email', 'password'),
    signup
);

// @route   POST /api/auth/login
router.post('/login', validateEmail, validateRequired('email', 'password'), login);

// @route   GET /api/auth/google
router.get(
    '/google',
    (req, res, next) => {
        const { role } = req.query;
        passport.authenticate('google', {
            scope: ['profile', 'email'],
            state: role || 'customer',
        })(req, res, next);
    }
);

// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    (req, res, next) => {
        // Move state back to query for the controller
        if (req.query.state) {
            req.query.role = req.query.state;
        }
        next();
    },
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleAuthCallback
);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', validateEmail, validateRequired('email'), forgotPassword);

// @route   POST /api/auth/verify-otp
router.post('/verify-otp', validateRequired('email', 'code'), verifyOTP);

// @route   POST /api/auth/resend-otp
router.post('/resend-otp', validateRequired('email'), resendOTP);

// @route   POST /api/auth/reset-password
router.post(
    '/reset-password',
    validatePassword,
    validateRequired('email', 'code', 'newPassword'),
    resetPassword
);

// @route   GET /api/auth/me
router.get('/me', authenticate, getMe);

module.exports = router;
