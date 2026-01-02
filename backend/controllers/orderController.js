const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// Shipping fee calculation (Rwanda Local)
const calculateShippingFee = (totalPrice) => {
    if (totalPrice >= 50000) return 0; // Free shipping over 50,000 Rwf
    return 2000; // Flat 2,000 Rwf shipping
};

/**
 * @route   POST /api/orders
 * @desc    Create order from cart
 * @access  Private/Customer
 */
const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod } = req.body;

    // Validate payment method
    if (!['momo', 'stripe'].includes(paymentMethod)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid payment method. Must be momo or stripe.',
        });
    }

    // Get cart
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
        'items.productId'
    );

    if (!cart || cart.items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Cart is empty',
        });
    }

    // Validate stock and prepare order items
    const orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
        const product = item.productId;

        if (!product) {
            return res.status(400).json({
                success: false,
                message: 'One or more products in cart no longer exist',
            });
        }

        if (!product.isInStock(item.quantity)) {
            return res.status(400).json({
                success: false,
                message: `${product.name} - Only ${product.stock} items available`,
            });
        }

        orderItems.push({
            productId: product._id,
            sellerId: item.sellerId,
            name: product.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: product.imageUrl,
        });

        totalPrice += item.price * item.quantity;

        // Decrease product stock
        product.decreaseStock(item.quantity);
        await product.save();
    }

    // Calculate fees
    const shippingFee = calculateShippingFee(totalPrice);
    const grandTotal = totalPrice + shippingFee;

    // Create order
    const order = await Order.create({
        userId: req.user._id,
        items: orderItems,
        totalPrice,
        shippingFee,
        grandTotal,
        paymentMethod,
        shippingAddress,
    });

    // Clear cart
    cart.clearCart();
    await cart.save();

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order },
    });
});

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get customer's orders
 * @access  Private/Customer
 */
const getMyOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.user._id })
        .populate('items.productId', 'name imageUrl')
        .populate('items.sellerId', 'name email')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await Order.countDocuments({ userId: req.user._id });

    res.json({
        success: true,
        data: {
            orders,
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
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private(Customer/Seller/Admin)
 */
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('items.productId', 'name imageUrl')
        .populate('items.sellerId', 'name email');

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Check access rights
    // Safely get IDs as strings
    const orderUserId = order.userId?._id?.toString() || order.userId?.toString();
    const currentUserId = req.user._id.toString();

    const isCustomer = orderUserId === currentUserId;
    const isSeller = req.user.role === 'seller' && order.hasSeller(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isSeller && !isAdmin) {
        return res.status(403).json({
            success: false,
            message: `Access denied. Your role: ${req.user.role}. You are not the buyer, the seller, or an admin.`,
        });
    }

    // If seller, filter to show only their items
    let responseData = order;
    if (isSeller && !isAdmin) {
        const sellerItems = order.getItemsBySeller(req.user._id);
        responseData = {
            ...order.toObject(),
            items: sellerItems,
        };
    }

    res.json({
        success: true,
        data: { order: responseData },
    });
});

/**
 * @route   GET /api/orders/seller-orders
 * @desc    Get orders containing seller's products
 * @access  Private/Seller
 */
const getSellerOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ 'items.sellerId': req.user._id })
        .populate('userId', 'name email')
        .populate('items.productId', 'name imageUrl')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await Order.countDocuments({ 'items.sellerId': req.user._id });

    // Filter items to show only seller's items
    const filteredOrders = orders.map((order) => ({
        ...order.toObject(),
        items: order.getItemsBySeller(req.user._id),
    }));

    res.json({
        success: true,
        data: {
            orders: filteredOrders,
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
 * @route   GET /api/orders
 * @desc    Get all orders (Admin only)
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
        .populate('userId', 'name email')
        .populate('items.productId', 'name imageUrl')
        .populate('items.sellerId', 'name email')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.json({
        success: true,
        data: {
            orders,
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
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Admin only)
 * @access  Private/Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderStatus, paymentStatus, shippingStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    if (orderStatus) {
        const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }
        order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
        const validStatuses = ['pending', 'paid', 'failed'];
        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }
        order.paymentStatus = paymentStatus;
    }

    if (shippingStatus) {
        const validStatuses = ['not_shipped', 'in_transit', 'delivered'];
        if (!validStatuses.includes(shippingStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid shipping status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }
        order.shippingStatus = shippingStatus;
    }

    await order.save();

    res.json({
        success: true,
        message: 'Order status updated successfully',
        data: { order },
    });
});

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getSellerOrders,
    getAllOrders,
    updateOrderStatus,
};
