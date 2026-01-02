import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user's role is allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return (
            <div className="access-denied">
                <h1>Access Denied</h1>
                <p>You don't have permission to access this page.</p>
                <a href="/">Go to Home</a>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
