const mongoose = require('mongoose');
const crypto = require('crypto');

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'OTP code is required'],
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
    },
    {
        timestamps: true,
    }
);

// Index for email lookup and TTL for auto-deletion
otpSchema.index({ email: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to generate OTP
otpSchema.statics.generateOTP = function () {
    return crypto.randomInt(100000, 999999).toString();
};

// Static method to create and save OTP
otpSchema.statics.createOTP = async function (email) {
    // Delete any existing OTPs for this email
    await this.deleteMany({ email });

    const code = this.generateOTP();
    const otp = await this.create({ email, code });

    return code;
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function (email, code) {
    const otp = await this.findOne({
        email,
        code,
        expiresAt: { $gt: new Date() },
    });

    if (!otp) {
        return false;
    }

    // Delete OTP after verification
    await this.deleteOne({ _id: otp._id });

    return true;
};

module.exports = mongoose.model('OTP', otpSchema);
