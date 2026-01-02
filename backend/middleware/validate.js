const mongoose = require('mongoose');

/**
 * Validate email format
 */
const validateEmail = (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required',
        });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address',
        });
    }

    next();
};

/**
 * Validate password strength
 */
const validatePassword = (req, res, next) => {
    const password = req.body.password || req.body.newPassword;

    if (!password) {
        return res.status(400).json({
            success: false,
            message: 'Password is required',
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long',
        });
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Password must contain at least one uppercase letter',
        });
    }

    // Check for at least one number
    if (!/[0-9]/.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Password must contain at least one number',
        });
    }

    next();
};

/**
 * Validate MongoDB ObjectId
 * @param {string} paramName - Name of the parameter to validate
 */
const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ${paramName} format`,
            });
        }

        next();
    };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1) {
        return res.status(400).json({
            success: false,
            message: 'Page number must be greater than 0',
        });
    }

    if (limit < 1 || limit > 100) {
        return res.status(400).json({
            success: false,
            message: 'Limit must be between 1 and 100',
        });
    }

    req.pagination = {
        page,
        limit,
        skip: (page - 1) * limit,
    };

    next();
};

/**
 * Validate required fields
 * @param  {...string} fields - Required field names
 */
const validateRequired = (...fields) => {
    return (req, res, next) => {
        const missingFields = [];

        fields.forEach((field) => {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`,
            });
        }

        next();
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateObjectId,
    validatePagination,
    validateRequired,
};
