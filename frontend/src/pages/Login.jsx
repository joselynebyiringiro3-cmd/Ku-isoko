import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, verifyLoginOTP, isAuthenticated, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            // Redirect based on role
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
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Required'),
            password: Yup.string().required('Required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            const result = await login(values.email, values.password);
            setLoading(false);

            if (result.success && result.needsOTP) {
                setEmail(values.email);
                setShowOTP(true);
            } else if (result.success) {
                // Navigation handled by useEffect
            } else if (result.unverified) {
                sessionStorage.setItem('verify_email', values.email);
                navigate('/verify-email', { state: { email: values.email } });
            }
        },
    });

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return;

        setLoading(true);
        const result = await verifyLoginOTP(email, otp);
        setLoading(false);

        if (result.success) {
            // Navigation handled by useEffect
        }
    };

    const handleGoogleLogin = () => {
        const rawApiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        let baseUrl = rawApiBase.endsWith('/') ? rawApiBase.slice(0, -1) : rawApiBase;

        // Force /api if it's missing from the base URL
        if (!baseUrl.toLowerCase().endsWith('/api')) {
            baseUrl += '/api';
        }

        window.location.href = `${baseUrl}/auth/google?role=customer`;
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{showOTP ? 'Verify Identity' : 'Welcome Back'}</h2>
                <p className="subtitle">
                    {showOTP
                        ? `Enter the 6-digit code sent to ${email}`
                        : 'Login to your account'}
                </p>

                {!showOTP && (
                    <>
                        <button className="google-btn" onClick={handleGoogleLogin} type="button">
                            <FaGoogle /> Continue with Google
                        </button>

                        <div className="divider">
                            <span>or</span>
                        </div>
                    </>
                )}

                {showOTP ? (
                    <form onSubmit={handleOTPSubmit}>
                        <div className="form-group">
                            <label htmlFor="otp">Verification Code</label>
                            <input
                                id="otp"
                                type="text"
                                placeholder="000000"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="otp-input-field"
                                required
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading || otp.length !== 6}>
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>

                        <button
                            type="button"
                            className="text-btn"
                            onClick={() => setShowOTP(false)}
                            style={{
                                marginTop: '1rem',
                                width: '100%',
                                background: 'transparent',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '0.8rem',
                                color: '#666',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Back to Login
                        </button>
                    </form>
                ) : (
                    <form onSubmit={formik.handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
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
                            <label htmlFor="password">Password</label>
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

                        <div className="form-footer">
                            <a href="/forgot-password" className="forgot-link">Forgot Password?</a>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Validating...' : 'Login'}
                        </button>
                    </form>
                )}

                <p className="switch-auth">
                    {showOTP ? '' : (
                        <>Don't have an account? <a href="/signup">Sign up</a></>
                    )}
                </p>
            </div>
        </div>
    );
};

export default Login;
