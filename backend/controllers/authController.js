const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const OTP = require('../models/OTP');
const { generateToken } = require('../utils/jwt');
const { sendOTPEmail, sendVerificationEmail } = require('../utils/email');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User with this email already exists',
        });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        phone,
        role: role || 'customer',
        isVerified: false, // Require OTP verification
    });

    // If role is seller, create seller profile
    if (user.role === 'seller') {
        await SellerProfile.create({
            userId: user._id,
            storeName: req.body.storeName || `${name}'s Store`,
            storeDescription: req.body.storeDescription || '',
            phone: phone || '',
            sellerStatus: 'pending', // Require admin approval
        });
    }

    // Generate and save OTP
    const otpCode = await OTP.createOTP(email);

    // Send verification OTP email
    await sendOTPEmail(email, otpCode, 'Account Verification OTP');

    res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for the verification OTP.',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
            },
        },
    });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
        });
    }

    // Check if user is active
    if (!user.isActive) {
        return res.status(403).json({
            success: false,
            message: 'Your account has been deactivated. Please contact support.',
        });
    }

    // Check if user is verified
    if (!user.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Please verify your email before logging in.',
        });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
        });
    }

    // Generate and save OTP for Two-Step Login
    const otpCode = await OTP.createOTP(email);

    // Send Login OTP email
    await sendOTPEmail(email, otpCode, 'Login Verification OTP');

    res.json({
        success: true,
        message: 'Credentials valid. Please check your email for the login OTP.',
        data: {
            needsOTP: true,
            email: user.email
        }
    });
});

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
// Handled by passport in routes

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
const googleAuthCallback = asyncHandler(async (req, res) => {
    // User is attached by passport
    const user = req.user;

    // Only update role if it's a BRAND NEW account (isNewAccount)
    // AND a role was specifically requested in the query
    if (user.isNewAccount && req.query.role && ['customer', 'seller'].includes(req.query.role)) {
        user.role = req.query.role;
        await user.save();

        // Create seller profile if role is seller
        if (user.role === 'seller') {
            const existingProfile = await SellerProfile.findOne({ userId: user._id });
            if (!existingProfile) {
                await SellerProfile.create({
                    userId: user._id,
                    storeName: `${user.name}'s Store`,
                    storeDescription: '',
                    phone: '',
                    sellerStatus: 'active',
                });
            }
        }
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/google/success?token=${token}&role=${user.role}`);
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP for password reset
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'No user found with this email',
        });
    }

    // Generate and save OTP
    const otpCode = await OTP.createOTP(email);

    // Send OTP email
    await sendOTPEmail(email, otpCode);

    res.json({
        success: true,
        message: 'OTP sent to your email. It will expire in 10 minutes.',
    });
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP code
 * @access  Public
 */
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    // Verify OTP
    const isValid = await OTP.verifyOTP(email, code);

    if (!isValid) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or expired OTP',
        });
    }

    // Find user and mark as verified
    const user = await User.findOne({ email });
    if (user) {
        user.isVerified = true;
        await user.save();

        // Send welcome email after successful verification
        await sendVerificationEmail(email, user.name);
    }

    // Generate token for automatic login after verification
    const token = user ? generateToken(user._id, user.role) : null;

    res.json({
        success: true,
        message: 'OTP verified successfully.',
        data: user ? {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
            },
            token
        } : null
    });
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { email, code, newPassword } = req.body;

    // Verify OTP
    const isValid = await OTP.verifyOTP(email, code);

    if (!isValid) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or expired OTP',
        });
    }

    // Find user and update password
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
    });
});

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend verification OTP
 * @access  Public
 */
const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'No user found with this email',
        });
    }

    if (user.isVerified) {
        return res.status(400).json({
            success: false,
            message: 'Account is already verified',
        });
    }

    // Generate and save OTP
    const otpCode = await OTP.createOTP(email);

    // Send verification OTP email
    await sendOTPEmail(email, otpCode, 'Account Verification OTP');

    res.json({
        success: true,
        message: 'New OTP sent to your email.',
    });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('sellerProfile');

    res.json({
        success: true,
        data: { user },
    });
});

module.exports = {
    signup,
    login,
    googleAuthCallback,
    forgotPassword,
    verifyOTP,
    resetPassword,
    resendOTP,
    getMe,
};
