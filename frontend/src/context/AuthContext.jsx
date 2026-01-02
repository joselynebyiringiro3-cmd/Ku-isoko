import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data.data.user);
                    setToken(storedToken);
                } catch (error) {
                    console.error('Failed to load user:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user: userData, token: authToken, needsOTP } = response.data.data;

            if (needsOTP) {
                return { success: true, needsOTP: true };
            }

            setUser(userData);
            setToken(authToken);
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));

            toast.success('Login successful!');
            return { success: true, user: userData };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';

            // Handle unverified account or 2FA requirement
            if (error.response?.status === 403 && message.toLowerCase().includes('verify')) {
                return { success: false, error: message, unverified: true };
            }

            return { success: false, error: message };
        }
    };

    const verifyLoginOTP = async (email, code) => {
        try {
            const response = await api.post('/auth/verify-otp', { email, code });
            const { user: userData, token: authToken } = response.data.data;

            if (authToken) {
                setUser(userData);
                setToken(authToken);
                localStorage.setItem('token', authToken);
                localStorage.setItem('user', JSON.stringify(userData));
                toast.success('Login successful!');
                return { success: true, user: userData };
            }
            return { success: false, error: 'Verification failed' };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Verification failed' };
        }
    };

    const signup = async (formData) => {
        try {
            const response = await api.post('/auth/signup', formData);

            toast.success('Registration successful! Please verify your email.');

            // Store email for verification page
            sessionStorage.setItem('verify_email', formData.email);

            return { success: true, needsVerification: true, email: formData.email };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Signup failed' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
    };

    const registerToken = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        verifyLoginOTP,
        signup,
        logout,
        registerToken,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
