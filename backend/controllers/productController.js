const Product = require('../models/Product');
const SellerProfile = require('../models/SellerProfile');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/products
 * @desc    Create a new product (Seller only)
 * @access  Private/Seller
 */
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, stock, category, imageUrl } = req.body;

    // Check if seller is active
    const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
    if (!sellerProfile || sellerProfile.sellerStatus !== 'active') {
        return res.status(403).json({
            success: false,
            message: 'Your seller account is not active. Please contact admin.',
        });
    }

    const product = await Product.create({
        name,
        description,
        price,
        stock,
        category,
        imageUrl,
        sellerId: req.user._id,
    });

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product },
    });
});

/**
 * @route   GET /api/products
 * @desc    Get all products with filters
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        category,
        minPrice,
        maxPrice,
        search,
        sellerId,
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (category) filter.category = category;
    if (sellerId) filter.sellerId = sellerId;

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
        // Escape special regex characters
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // 1. Standard partial match (e.g., "iPhone")
        const searchRegex = new RegExp(escapeRegex(search), 'i');

        // 2. Fuzzy match for concatenated terms (e.g., "i14" matches "iPhone 14")
        // Split by space, then join chars with .* to allow anything in between
        const terms = search.split(/\s+/).filter(t => t.length > 0);
        const fuzzyPattern = terms.map(term => escapeRegex(term).split('').join('.*')).join('.*');
        const fuzzyRegex = new RegExp(fuzzyPattern, 'i');

        filter.$or = [
            { name: searchRegex },
            { description: searchRegex },
            // Fuzzy match on name only to reduce noise
            { name: fuzzyRegex }
        ];
    }

    const products = await Product.find(filter)
        .populate('sellerId', 'name email')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
        success: true,
        data: {
            products,
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
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('sellerId', 'name email')
        .populate({
            path: 'sellerId',
            populate: {
                path: 'sellerProfile',
                select: 'storeName storeDescription logoUrl',
            },
        });

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    res.json({
        success: true,
        data: { product },
    });
});

/**
 * @route   GET /api/products/:id/related
 * @desc    Get related products
 * @access  Public
 */
const getRelatedProducts = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    // Get products from same category or same seller, excluding current product
    const relatedProducts = await Product.find({
        _id: { $ne: product._id },
        $or: [
            { category: product.category },
            { sellerId: product.sellerId },
        ],
    })
        .populate('sellerId', 'name email')
        .limit(6)
        .sort({ averageRating: -1, createdAt: -1 });

    res.json({
        success: true,
        data: { relatedProducts },
    });
});

/**
 * @route   GET /api/products/my-products
 * @desc    Get seller's own products
 * @access  Private/Seller
 */
const getMyProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find({ sellerId: req.user._id })
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ sellerId: req.user._id });

    res.json({
        success: true,
        data: {
            products,
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
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private/Seller/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    // Check if user is seller owner or admin
    if (
        req.user.role !== 'admin' &&
        product.sellerId.toString() !== req.user._id.toString()
    ) {
        return res.status(403).json({
            success: false,
            message: 'You can only update your own products',
        });
    }

    const { name, description, price, stock, category, imageUrl } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (category) product.category = category;
    if (imageUrl) product.imageUrl = imageUrl;

    await product.save();

    res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product },
    });
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private/Seller/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    // Check if user is seller owner or admin
    if (
        req.user.role !== 'admin' &&
        product.sellerId.toString() !== req.user._id.toString()
    ) {
        return res.status(403).json({
            success: false,
            message: 'You can only delete your own products',
        });
    }

    await product.deleteOne();

    res.json({
        success: true,
        message: 'Product deleted successfully',
    });
});

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    getRelatedProducts,
    getMyProducts,
    updateProduct,
    deleteProduct,
};
