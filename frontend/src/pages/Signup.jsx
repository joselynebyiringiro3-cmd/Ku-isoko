import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import './Login.css';

const Signup = () => {
    const navigate = useNavigate();
    const { signup, isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('customer');

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user?.role === 'seller') {
                navigate('/seller/dashboard');
            } else {
                navigate('/');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            storeName: '',
            storeDescription: '',
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .min(2, 'Name must be at least 2 characters')
                .required('Required'),
            email: Yup.string().email('Invalid email address').required('Required'),
            password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
                .matches(/[0-9]/, 'Password must contain at least one number')
                .required('Required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Required'),
            phone: Yup.string(),
            storeName: role === 'seller' ? Yup.string().required('Store name is required for sellers') : Yup.string(),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            const result = await signup({ ...values, role });
            setLoading(false);

            if (result.success && result.needsVerification) {
                navigate('/verify-email', { state: { email: values.email } });
            }
        },
    });

    const handleGoogleSignup = () => {
        const rawApiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        let baseUrl = rawApiBase.endsWith('/') ? rawApiBase.slice(0, -1) : rawApiBase;

        // Force /api if it's missing from the base URL
        if (!baseUrl.toLowerCase().endsWith('/api')) {
            baseUrl += '/api';
        }

        window.location.href = `${baseUrl}/auth/google?role=${role}`;
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p className="subtitle">Join Ku-isoko today</p>

                <div className="role-selector">
                    <div className={`role-option ${role === 'customer' ? 'selected' : ''}`} onClick={() => setRole('customer')}>
                        <input type="radio" name="role" value="customer" checked={role === 'customer'} onChange={() => { }} />
                        <strong>Customer</strong>
                        <p>Shop from sellers</p>
                    </div>
                    <div className={`role-option ${role === 'seller' ? 'selected' : ''}`} onClick={() => setRole('seller')}>
                        <input type="radio" name="role" value="seller" checked={role === 'seller'} onChange={() => { }} />
                        <strong>Seller</strong>
                        <p>Sell your products</p>
                    </div>
                </div>

                <button className="google-btn" onClick={handleGoogleSignup} type="button">
                    <FaGoogle /> Continue with Google
                </button>

                <div className="divider">
                    <span>or</span>
                </div>

                <form onSubmit={formik.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                            id="name"
                            type="text"
                            {...formik.getFieldProps('name')}
                            className={formik.touched.name && formik.errors.name ? 'error' : ''}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <div className="error-message">{formik.errors.name}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            id="email"
                            type="email"
                            {...formik.getFieldProps('email')}
                            className={formik.touched.email && formik.errors.email ? 'error' : ''}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="error-message">{formik.errors.email}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id="phone"
                            type="tel"
                            {...formik.getFieldProps('phone')}
                        />
                    </div>

                    {role === 'seller' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="storeName">Store Name *</label>
                                <input
                                    id="storeName"
                                    type="text"
                                    {...formik.getFieldProps('storeName')}
                                    className={formik.touched.storeName && formik.errors.storeName ? 'error' : ''}
                                />
                                {formik.touched.storeName && formik.errors.storeName && (
                                    <div className="error-message">{formik.errors.storeName}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="storeDescription">Store Description</label>
                                <textarea
                                    id="storeDescription"
                                    rows="3"
                                    {...formik.getFieldProps('storeDescription')}
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <input
                            id="password"
                            type="password"
                            {...formik.getFieldProps('password')}
                            className={formik.touched.password && formik.errors.password ? 'error' : ''}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <div className="error-message">{formik.errors.password}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password *</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            {...formik.getFieldProps('confirmPassword')}
                            className={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'error' : ''}
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                            <div className="error-message">{formik.errors.confirmPassword}</div>
                        )}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="switch-auth">
                    Already have an account? <a href="/login">Login</a>
                </p>
            </div>
        </div >
    );
};

export default Signup;
