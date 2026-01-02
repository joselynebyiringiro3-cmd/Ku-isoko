import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing Login styles for consistency

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: ''
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Email is required')
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                await api.post('/auth/forgot-password', { email: values.email });
                toast.success('OTP sent to your email');

                // Store email for reset page
                sessionStorage.setItem('reset_email', values.email);

                // Redirect to reset password page after a short delay
                setTimeout(() => navigate('/reset-password'), 2000);
            } catch (error) {
                console.error('Forgot password failed:', error);
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Forgot Password</h2>
                <p className="subtitle">Enter your email to receive a reset link</p>

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

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                    </button>
                </form>

                <p className="switch-auth">
                    Remember your password? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
