const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, status } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const users = await User.find(filter)
        .select('-password')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
        success: true,
        data: {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        },
    });
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin only)
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password')
        .populate('sellerProfile');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    res.json({
        success: true,
        data: { user },
    });
});

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!['customer', 'seller', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid role. Must be customer, seller, or admin.',
        });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Synchronization logic for Seller Profile
    if (role === 'seller') {
        // If promoting to seller, ensure profile is ACTIVE
        let profile = await SellerProfile.findOne({ userId: user._id });
        if (!profile) {
            await SellerProfile.create({
                userId: user._id,
                storeName: `${user.name}'s Store`,
                storeDescription: '',
                phone: user.phone || '07XXXXXXXX',
                sellerStatus: 'active', // Force active when admin sets role
            });
        } else if (profile.sellerStatus !== 'active') {
            profile.sellerStatus = 'active';
            await profile.save();
        }
    } else if (oldRole === 'seller' && role !== 'seller') {
        // If demoting FROM seller TO something else, BLOCK their profile
        const profile = await SellerProfile.findOne({ userId: user._id });
        if (profile) {
            profile.sellerStatus = 'blocked'; // Block so they don't appear as seller anymore
            await profile.save();
        }
    }

    res.json({
        success: true,
        message: `User role updated to ${role}`,
        data: { user },
    });
});

/**
 * @route   PUT /api/users/:id/toggle-active
 * @desc    Activate/Deactivate user (Admin only)
 * @access  Private/Admin
 */
const toggleUserActive = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user },
    });
});

module.exports = {
    getAllUsers,
    getUserById,
    updateUserRole,
    toggleUserActive,
};
