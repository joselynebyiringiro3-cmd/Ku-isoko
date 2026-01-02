const mongoose = require('mongoose');

const sellerProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        storeName: {
            type: String,
            required: [true, 'Store name is required'],
            trim: true,
            minlength: [3, 'Store name must be at least 3 characters'],
            maxlength: [100, 'Store name cannot exceed 100 characters'],
        },
        storeDescription: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        logoUrl: {
            type: String,
            default: '',
        },
        sellerStatus: {
            type: String,
            enum: ['pending', 'active', 'blocked'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
sellerProfileSchema.index({ sellerStatus: 1 });

// Populate user details when querying seller profile
sellerProfileSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'userId',
        select: 'name email',
    });
    next();
});

module.exports = mongoose.model('SellerProfile', sellerProfileSchema);
