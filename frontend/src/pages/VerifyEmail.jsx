import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { registerToken, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Get email from location state or sessionStorage
        const stateEmail = location.state?.email || sessionStorage.getItem('verify_email');
        if (!stateEmail) {
            toast.error('No email found to verify. Please sign up or login.');
            navigate('/signup');
            return;
        }
        setEmail(stateEmail);
    }, [location, navigate]);

    const formik = useFormik({
        initialValues: {
            code: '',
        },
        validationSchema: Yup.object({
            code: Yup.string()
                .length(6, 'OTP must be 6 digits')
                .matches(/^[0-9]+$/, 'Must be only digits')
                .required('Required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = await api.post('/auth/verify-otp', {
                    email,
                    code: values.code,
                });

                if (response.data.success) {
                    toast.success('Email verified successfully!');
                    const { token, user } = response.data.data;

                    // Log the user in
                    registerToken(token);
                    updateUser(user);
                    sessionStorage.removeItem('verify_email');

                    // Redirect based on role
                    if (user.role === 'admin') navigate('/admin/dashboard');
                    else if (user.role === 'seller') navigate('/seller/dashboard');
                    else navigate('/');
                }
            } catch (error) {
                console.error('Verification failed:', error);
            } finally {
                setLoading(false);
            }
        },
    });

    const handleResendOTP = async () => {
        setResending(true);
        try {
            await api.post('/auth/resend-otp', { email });
            toast.success('New OTP sent to your email');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Verify Your Email</h2>
                <p className="subtitle">We've sent a 6-digit code to <strong>{email}</strong></p>

                <form onSubmit={formik.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="code">Enter Verification Code</label>
                        <input
                            id="code"
                            type="text"
                            maxLength="6"
                            {...formik.getFieldProps('code')}
                            className={formik.touched.code && formik.errors.code ? 'error' : ''}
                            placeholder="000000"
                        />
                        {formik.touched.code && formik.errors.code && (
                            <div className="error-message">{formik.errors.code}</div>
                        )}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>

                <div className="form-footer">
                    <p>Didn't receive the code?</p>
                    <button
                        onClick={handleResendOTP}
                        className="resend-btn"
                        disabled={resending}
                        style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {resending ? 'Sending...' : 'Resend OTP'}
                    </button>
                </div>

                <p className="switch-auth">
                    Back to <a href="/login">Login</a>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
