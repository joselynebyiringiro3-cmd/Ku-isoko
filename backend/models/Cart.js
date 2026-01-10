const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
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
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
    },
}, { _id: true });

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: [cartItemSchema],
    },
    {
        timestamps: true,
    }
);

// Indexes

// Calculate cart total
cartSchema.methods.calculateTotal = function () {
    return this.items.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
};

// Add item to cart
cartSchema.methods.addItem = function (productId, sellerId, quantity, price) {
    const existingItemIndex = this.items.findIndex(
        (item) => item.productId.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
        // Update existing item
        this.items[existingItemIndex].quantity += quantity;
        this.items[existingItemIndex].price = price; // Refresh price
    } else {
        // Add new item
        this.items.push({ productId, sellerId, quantity, price });
    }
};

// Update item quantity
cartSchema.methods.updateQuantity = function (itemId, quantity) {
    const item = this.items.id(itemId);
    if (item) {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            this.items.pull(itemId);
        } else {
            item.quantity = quantity;
        }
        return true;
    }
    return false;
};

// Remove item from cart
cartSchema.methods.removeItem = function (itemId) {
    this.items.pull(itemId);
};

// Clear cart
cartSchema.methods.clearCart = function () {
    this.items = [];
};

module.exports = mongoose.model('Cart', cartSchema);
