const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
    },
    imageUrl: {
        type: String,
    },
}, { _id: true });

const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone is required'],
        trim: true,
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
    },
    addressLine: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
    },
}, { _id: false });

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
        totalPrice: {
            type: Number,
            required: true,
            min: [0, 'Total price cannot be negative'],
        },
        shippingFee: {
            type: Number,
            default: 0,
            min: [0, 'Shipping fee cannot be negative'],
        },
        grandTotal: {
            type: Number,
            required: true,
            min: [0, 'Grand total cannot be negative'],
        },
        paymentMethod: {
            type: String,
            enum: ['momo', 'stripe'],
            required: [true, 'Payment method is required'],
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        orderStatus: {
            type: String,
            enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        shippingStatus: {
            type: String,
            enum: ['not_shipped', 'in_transit', 'delivered'],
            default: 'not_shipped',
        },
        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },
        momoTransactionId: {
            type: String,
        },
        stripePaymentId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
orderSchema.index({ userId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'items.sellerId': 1 });
orderSchema.index({ createdAt: -1 });

// Get items for a specific seller
orderSchema.methods.getItemsBySeller = function (sellerId) {
    const sIdStr = sellerId.toString();
    return this.items.filter((item) => {
        const itemSellerId = item.sellerId?._id?.toString() || item.sellerId?.toString();
        return itemSellerId === sIdStr;
    });
};

// Check if order contains items from a specific seller
orderSchema.methods.hasSeller = function (sellerId) {
    const sIdStr = sellerId.toString();
    return this.items.some((item) => {
        const itemSellerId = item.sellerId?._id?.toString() || item.sellerId?.toString();
        return itemSellerId === sIdStr;
    });
};

module.exports = mongoose.model('Order', orderSchema);
