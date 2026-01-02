const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product ID is required'],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [1000, 'Comment cannot exceed 1000 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1 });

// Static method to calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function (productId) {
    const Product = mongoose.model('Product');

    const stats = await this.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        {
            $group: {
                _id: '$productId',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            averageRating: Math.round(stats[0].averageRating * 10) / 10,
            reviewCount: stats[0].reviewCount,
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            averageRating: 0,
            reviewCount: 0,
        });
    }
};

// Update product rating after save
reviewSchema.post('save', function () {
    this.constructor.calculateAverageRating(this.productId);
});

// Update product rating after remove
reviewSchema.post('remove', function () {
    this.constructor.calculateAverageRating(this.productId);
});

// Update product rating after findOneAndDelete
reviewSchema.post('findOneAndDelete', function (doc) {
    if (doc) {
        doc.constructor.calculateAverageRating(doc.productId);
    }
});

module.exports = mongoose.model('Review', reviewSchema);
