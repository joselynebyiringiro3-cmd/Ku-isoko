import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaStore, FaPaperPlane, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Loader from '../components/Loader';
import './Login.css';

const BecomeSeller = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [existingRequest, setExistingRequest] = useState(null);

    useEffect(() => {
        const checkRequest = async () => {
            try {
                const response = await api.get('/sellers/profile/me');
                if (response.data.success && response.data.data.seller) {
                    setExistingRequest(response.data.data.seller);
                }
            } catch (error) {
                console.log('No existing seller profile found');
            } finally {
                setChecking(false);
            }
        };
        checkRequest();
    }, []);

    const formik = useFormik({
        initialValues: {
            storeName: '',
            storeDescription: '',
            phone: '',
        },
        validationSchema: Yup.object({
            storeName: Yup.string()
                .min(3, 'Store name must be at least 3 characters')
                .required('Required'),
            storeDescription: Yup.string()
                .min(20, 'Please provide a more detailed description (min 20 chars)')
                .required('Required'),
            phone: Yup.string()
                .required('Phone number is required'),
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const response = await api.post('/sellers/request-upgrade', values);
                toast.success(response.data.message);
                setExistingRequest(response.data.data.seller);
            } catch (error) {
                console.error('Request failed:', error);
                toast.error(error.response?.data?.message || 'Failed to submit request');
            } finally {
                setLoading(false);
            }
        },
    });

    if (checking) return <Loader />;

    if (existingRequest) {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    {existingRequest.sellerStatus === 'pending' ? (
                        <>
                            <FaClock style={{ fontSize: '4rem', color: '#667eea', marginBottom: '1.5rem' }} />
                            <h2>Request Pending</h2>
                            <p className="subtitle">Your request for <strong>{existingRequest.storeName}</strong> is currently being reviewed.</p>
                            <p style={{ color: '#718096', marginBottom: '2rem' }}>We will notify you once your account is activated.</p>
                        </>
                    ) : existingRequest.sellerStatus === 'active' ? (
                        <>
                            <FaCheckCircle style={{ fontSize: '4rem', color: '#48bb78', marginBottom: '1.5rem' }} />
                            <h2>You are a Seller!</h2>
                            <p className="subtitle">Your store <strong>{existingRequest.storeName}</strong> is active.</p>
                            <button className="submit-btn" onClick={() => navigate('/seller/dashboard')}>Go to Dashboard</button>
                        </>
                    ) : (
                        <>
                            <FaExclamationTriangle style={{ fontSize: '4rem', color: '#f56565', marginBottom: '1.5rem' }} />
                            <h2>Account Suspended</h2>
                            <p className="subtitle">Your seller account is currently blocked.</p>
                        </>
                    )}
                    <p className="switch-auth" style={{ marginTop: '2rem' }}>
                        <a href="/">Back to Home</a>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Become a Seller</h2>
                <p className="subtitle">Start selling your products on Ku-isoko</p>

                <form onSubmit={formik.handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="storeName">Store Name *</label>
                        <input
                            id="storeName"
                            type="text"
                            {...formik.getFieldProps('storeName')}
                            className={formik.touched.storeName && formik.errors.storeName ? 'error' : ''}
                            placeholder="e.g. My Awesome Shop"
                        />
                        {formik.touched.storeName && formik.errors.storeName && (
                            <div className="error-message">{formik.errors.storeName}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Contact Phone Number *</label>
                        <input
                            id="phone"
                            type="tel"
                            {...formik.getFieldProps('phone')}
                            className={formik.touched.phone && formik.errors.phone ? 'error' : ''}
                            placeholder="e.g. +250..."
                        />
                        {formik.touched.phone && formik.errors.phone && (
                            <div className="error-message">{formik.errors.phone}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="storeDescription">Store Description *</label>
                        <textarea
                            id="storeDescription"
                            rows="4"
                            {...formik.getFieldProps('storeDescription')}
                            className={formik.touched.storeDescription && formik.errors.storeDescription ? 'error' : ''}
                            placeholder="What do you sell? (min 20 characters)"
                        />
                        {formik.touched.storeDescription && formik.errors.storeDescription && (
                            <div className="error-message">{formik.errors.storeDescription}</div>
                        )}
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        <FaPaperPlane style={{ marginRight: '8px' }} />
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>

                <p className="switch-auth">
                    Changed your mind? <a href="/">Go Home</a>
                </p>
            </div>
        </div>
    );
};

export default BecomeSeller;
