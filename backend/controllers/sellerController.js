const SellerProfile = require('../models/SellerProfile');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/sellers
 * @desc    Get all sellers
 * @access  Public/Admin
 */
const getAllSellers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) filter.sellerStatus = status;

    const sellers = await SellerProfile.find(filter)
        .populate('userId', 'name email isActive')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await SellerProfile.countDocuments(filter);

    res.json({
        success: true,
        data: {
            sellers,
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
 * @route   GET /api/sellers/:id
 * @desc    Get seller profile by ID
 * @access  Public
 */
const getSellerProfile = asyncHandler(async (req, res) => {
    const seller = await SellerProfile.findById(req.params.id).populate(
        'userId',
        'name email'
    );

    if (!seller) {
        return res.status(404).json({
            success: false,
            message: 'Seller not found',
        });
    }

    res.json({
        success: true,
        data: { seller },
    });
});

/**
 * @route   GET /api/sellers/profile/me
 * @desc    Get own seller profile
 * @access  Private/Seller
 */
const getMySellerProfile = asyncHandler(async (req, res) => {
    const seller = await SellerProfile.findOne({ userId: req.user._id }).populate(
        'userId',
        'name email'
    );

    if (!seller) {
        return res.status(200).json({
            success: true,
            data: { seller: null },
        });
    }

    res.json({
        success: true,
        data: { seller },
    });
});

/**
 * @route   PUT /api/sellers/profile
 * @desc    Update own seller profile
 * @access  Private/Seller
 */
const updateSellerProfile = asyncHandler(async (req, res) => {
    const { storeName, storeDescription, phone, logoUrl } = req.body;

    let seller = await SellerProfile.findOne({ userId: req.user._id });

    if (!seller) {
        return res.status(404).json({
            success: false,
            message: 'Seller profile not found',
        });
    }

    // Update fields
    if (storeName) seller.storeName = storeName;
    if (storeDescription !== undefined) seller.storeDescription = storeDescription;
    if (phone) seller.phone = phone;
    if (logoUrl !== undefined) seller.logoUrl = logoUrl;

    await seller.save();

    res.json({
        success: true,
        message: 'Seller profile updated successfully',
        data: { seller },
    });
});

/**
 * @route   PUT /api/sellers/:id/status
 * @desc    Update seller status (Admin only)
 * @access  Private/Admin
 */
const updateSellerStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!['pending', 'active', 'blocked'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be pending, active, or blocked.',
        });
    }

    const seller = await SellerProfile.findById(req.params.id);

    if (!seller) {
        return res.status(404).json({
            success: false,
            message: 'Seller not found',
        });
    }

    seller.sellerStatus = status;
    await seller.save();

    // Synchronization logic for User Role
    const user = await User.findById(seller.userId);
    if (user) {
        if (status === 'active') {
            // If seller profile becomes ACTIVE, force role to SELLER
            user.role = 'seller';
            await user.save();
        } else if (status === 'blocked' || status === 'pending') {
            // If seller profile is BLOCKED or PENDING, revert role to CUSTOMER (Client)
            // unless they are an admin
            if (user.role !== 'admin') {
                user.role = 'customer';
                await user.save();
            }
        }
    }

    res.json({
        success: true,
        message: `Seller status updated to ${status}`,
        data: { seller },
    });
});

/**
 * @route   POST /api/sellers/request-upgrade
 * @desc    Request upgrade to seller role
 * @access  Private/Customer
 */
const requestSellerUpgrade = asyncHandler(async (req, res) => {
    const { storeName, storeDescription, phone } = req.body;

    // Check if profile already exists
    let seller = await SellerProfile.findOne({ userId: req.user._id });

    if (seller) {
        if (seller.sellerStatus === 'active') {
            return res.status(400).json({
                success: false,
                message: 'You are already a seller',
            });
        }
        return res.status(400).json({
            success: false,
            message: 'A seller request is already pending or blocked',
        });
    }

    // Create pending seller profile
    seller = await SellerProfile.create({
        userId: req.user._id,
        storeName,
        storeDescription: storeDescription || '',
        phone,
        sellerStatus: 'pending',
    });

    res.status(201).json({
        success: true,
        message: 'Seller request submitted successfully and is pending approval.',
        data: { seller },
    });
});

module.exports = {
    getAllSellers,
    getSellerProfile,
    getMySellerProfile,
    updateSellerProfile,
    updateSellerStatus,
    requestSellerUpgrade,
};
