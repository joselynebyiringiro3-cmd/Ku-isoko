const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private/Customer
 */
const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ userId: req.user._id }).populate({
        path: 'items.productId',
        select: 'name price imageUrl stock sellerId',
    }).populate({
        path: 'items.sellerId',
        select: 'name email',
    });

    if (!cart) {
        cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const total = cart.calculateTotal();

    res.json({
        success: true,
        data: {
            cart,
            total,
        },
    });
});

/**
 * @route   POST /api/cart
 * @desc    Add item to cart
 * @access  Private/Customer
 */
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    // Validate product
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    // Check stock
    if (!product.isInStock(quantity)) {
        return res.status(400).json({
            success: false,
            message: `Only ${product.stock} items available in stock`,
        });
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
        cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    // Add item
    cart.addItem(productId, product.sellerId, quantity, product.price);
    await cart.save();

    // Populate and return
    await cart.populate({
        path: 'items.productId',
        select: 'name price imageUrl stock',
    });

    await cart.populate({
        path: 'items.sellerId',
        select: 'name email',
    });

    const total = cart.calculateTotal();

    res.json({
        success: true,
        message: 'Item added to cart',
        data: {
            cart,
            total,
        },
    });
});

/**
 * @route   PUT /api/cart/:itemId
 * @desc    Update cart item quantity
 * @access  Private/Customer
 */
const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;

    if (quantity < 0) {
        return res.status(400).json({
            success: false,
            message: 'Quantity cannot be negative',
        });
    }

    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
        return res.status(404).json({
            success: false,
            message: 'Cart not found',
        });
    }

    const item = cart.items.id(req.params.itemId);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: 'Item not found in cart',
        });
    }

    // Check stock if increasing quantity
    if (quantity > item.quantity) {
        const product = await Product.findById(item.productId);
        if (!product || !product.isInStock(quantity)) {
            return res.status(400).json({
                success: false,
                message: 'Requested quantity not available in stock',
            });
        }
    }

    cart.updateQuantity(req.params.itemId, quantity);
    await cart.save();

    await cart.populate({
        path: 'items.productId',
        select: 'name price imageUrl stock',
    });

    await cart.populate({
        path: 'items.sellerId',
        select: 'name email',
    });

    const total = cart.calculateTotal();

    res.json({
        success: true,
        message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
        data: {
            cart,
            total,
        },
    });
});

/**
 * @route   DELETE /api/cart/:itemId
 * @desc    Remove item from cart
 * @access  Private/Customer
 */
const removeFromCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
        return res.status(404).json({
            success: false,
            message: 'Cart not found',
        });
    }

    cart.removeItem(req.params.itemId);
    await cart.save();

    await cart.populate({
        path: 'items.productId',
        select: 'name price imageUrl stock',
    });

    await cart.populate({
        path: 'items.sellerId',
        select: 'name email',
    });

    const total = cart.calculateTotal();

    res.json({
        success: true,
        message: 'Item removed from cart',
        data: {
            cart,
            total,
        },
    });
});

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private/Customer
 */
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
        return res.status(404).json({
            success: false,
            message: 'Cart not found',
        });
    }

    cart.clearCart();
    await cart.save();

    res.json({
        success: true,
        message: 'Cart cleared',
        data: { cart },
    });
});

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};
