const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            minlength: [3, 'Product name must be at least 3 characters'],
            maxlength: [200, 'Product name cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            trim: true,
            minlength: [10, 'Description must be at least 10 characters'],
            maxlength: [5000, 'Description cannot exceed 5000 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        stock: {
            type: Number,
            required: [true, 'Stock is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        imageUrl: {
            type: String,
            required: [true, 'Product image is required'],
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Seller ID is required'],
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
productSchema.index({ sellerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });

// Virtual for seller details
productSchema.virtual('seller', {
    ref: 'User',
    localField: 'sellerId',
    foreignField: '_id',
    justOne: true,
});

// Method to check if product is in stock
productSchema.methods.isInStock = function (quantity = 1) {
    return this.stock >= quantity;
};

// Method to decrease stock
productSchema.methods.decreaseStock = function (quantity) {
    if (this.stock >= quantity) {
        this.stock -= quantity;
        return true;
    }
    return false;
};

module.exports = mongoose.model('Product', productSchema);
