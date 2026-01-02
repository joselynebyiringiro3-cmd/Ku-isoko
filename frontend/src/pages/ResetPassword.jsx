import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './Login.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState(sessionStorage.getItem('reset_email') || '');

    const formik = useFormik({
        initialValues: {
            email: email,
            code: '',
            password: '',
            confirmPassword: ''
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Email is required'),
            code: Yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
            password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .required('Password is required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Confirm Password is required')
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                await api.post('/auth/reset-password', {
                    email: values.email,
                    code: values.code,
                    newPassword: values.password
                });
                toast.success('Password reset successfully');
                sessionStorage.removeItem('reset_email');
                setTimeout(() => navigate('/login'), 2000);
            } catch (error) {
                console.error('Reset password failed:', error);
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Reset Password</h2>
                <p className="subtitle">Enter the OTP sent to your email and your new password</p>

                <form onSubmit={formik.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            {...formik.getFieldProps('email')}
                            className={formik.touched.email && formik.errors.email ? 'error' : ''}
                            placeholder="Enter your email"
                        />
                        {formik.touched.email && formik.errors.email && (
                            <div className="error-message">{formik.errors.email}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="code">Verification Code (OTP)</label>
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

                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            id="password"
                            type="password"
                            {...formik.getFieldProps('password')}
                            className={formik.touched.password && formik.errors.password ? 'error' : ''}
                            placeholder="Min 8 characters"
                        />
                        {formik.touched.password && formik.errors.password && (
                            <div className="error-message">{formik.errors.password}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            {...formik.getFieldProps('confirmPassword')}
                            className={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'error' : ''}
                            placeholder="Confirm new password"
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                            <div className="error-message">{formik.errors.confirmPassword}</div>
                        )}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <p className="switch-auth">
                    Remember your password? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
