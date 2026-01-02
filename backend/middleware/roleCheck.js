/**
 * Role-based access control middleware
 * @param  {...string} allowedRoles - Roles allowed to access the route
 * @returns Middleware function
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user exists (should be attached by authenticate middleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}`,
            });
        }

        next();
    };
};

/**
 * Check if user is admin
 */
const requireAdmin = requireRole('admin');

/**
 * Check if user is seller or admin
 */
const requireSellerOrAdmin = requireRole('seller', 'admin');

/**
 * Check if user is customer
 */
const requireCustomer = requireRole('customer');

/**
 * Check if user is seller or admin
 */
const requireSeller = requireRole('seller', 'admin');

/**
 * Verify user owns the resource or is admin
 * @param {Function} getResourceOwnerId - Function to extract owner ID from request
 */
const requireOwnerOrAdmin = (getResourceOwnerId) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        const ownerId = getResourceOwnerId(req);

        // Allow if admin or owner
        if (req.user.role === 'admin' || req.user._id.toString() === ownerId?.toString()) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own resources.',
        });
    };
};

module.exports = {
    requireRole,
    requireAdmin,
    requireSeller,
    requireCustomer,
    requireSellerOrAdmin,
    requireOwnerOrAdmin,
};
