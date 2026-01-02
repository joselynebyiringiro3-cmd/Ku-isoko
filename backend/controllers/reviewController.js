const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/reviews/products/:productId
 * @desc    Create review for a product
 * @access  Private/Customer
 */
const createReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    // Optional: Check if user has purchased the product
    const hasPurchased = await Order.findOne({
        userId: req.user._id,
        'items.productId': productId,
        paymentStatus: 'paid',
    });

    if (!hasPurchased) {
        return res.status(403).json({
            success: false,
            message: 'You can only review products you have purchased',
        });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
        productId,
        userId: req.user._id,
    });

    if (existingReview) {
        return res.status(400).json({
            success: false,
            message: 'You have already reviewed this product. Use update instead.',
        });
    }

    // Create review
    const review = await Review.create({
        productId,
        userId: req.user._id,
        rating,
        comment,
    });

    await review.populate('userId', 'name');

    res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: { review },
    });
});

/**
 * @route   GET /api/reviews/products/:productId
 * @desc    Get all reviews for a product
 * @access  Public
 */
const getProductReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId: req.params.productId })
        .populate('userId', 'name')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ productId: req.params.productId });

    // Get product for average rating
    const product = await Product.findById(req.params.productId);

    res.json({
        success: true,
        data: {
            reviews,
            averageRating: product?.averageRating || 0,
            reviewCount: product?.reviewCount || 0,
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
 * @route   PUT /api/reviews/:id
 * @desc    Update review
 * @access  Private/Customer (own review)
 */
const updateReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
        return res.status(404).json({
            success: false,
            message: 'Review not found',
        });
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You can only update your own reviews',
        });
    }

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    await review.populate('userId', 'name');

    res.json({
        success: true,
        message: 'Review updated successfully',
        data: { review },
    });
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review
 * @access  Private/Customer (own review) or Admin
 */
const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return res.status(404).json({
            success: false,
            message: 'Review not found',
        });
    }

    // Check if user owns the review or is admin
    const isOwner = review.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Access denied',
        });
    }

    await review.deleteOne();

    res.json({
        success: true,
        message: 'Review deleted successfully',
    });
});

module.exports = {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
};
