import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStore, FaSave } from 'react-icons/fa';
import './SellerProductForm.css'; // Reusing similar form styles

const SellerProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [initialValues, setInitialValues] = useState({
        storeName: '',
        description: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/sellers/profile/me');
            const profile = response.data.data.seller;
            setInitialValues({
                storeName: profile.storeName || '',
                description: profile.description || '',
                phone: profile.phone || '',
                address: profile.address || ''
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues,
        validationSchema: Yup.object({
            storeName: Yup.string().required('Store name is required'),
            description: Yup.string().min(20, 'Description must be at least 20 characters'),
            phone: Yup.string().matches(/^[0-9+\-\s()]*$/, 'Invalid phone number'),
            address: Yup.string()
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                await api.put('/sellers/profile/me', values);
                toast.success('Profile updated successfully');
            } catch (error) {
                console.error('Update failed:', error);
                toast.error(error.response?.data?.message || 'Failed to update profile');
            } finally {
                setLoading(false);
            }
        },
    });

    if (loading && !initialValues.storeName) {
        return <Loader />;
    }

    return (
        <div className="product-form-container">
            <div className="form-wrapper">
                <div className="form-card">
                    <h1 className="form-title">
                        <FaStore style={{ marginRight: '1rem', verticalAlign: 'middle' }} />
                        Store Profile
                    </h1>

                    <form onSubmit={formik.handleSubmit}>
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
                            <label htmlFor="description">Store Description</label>
                            <textarea
                                id="description"
                                rows="4"
                                {...formik.getFieldProps('description')}
                                className={formik.touched.description && formik.errors.description ? 'error' : ''}
                                placeholder="Tell customers about your store..."
                            />
                            {formik.touched.description && formik.errors.description && (
                                <div className="error-message">{formik.errors.description}</div>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    id="phone"
                                    type="text"
                                    {...formik.getFieldProps('phone')}
                                    className={formik.touched.phone && formik.errors.phone ? 'error' : ''}
                                />
                                {formik.touched.phone && formik.errors.phone && (
                                    <div className="error-message">{formik.errors.phone}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="address">Address</label>
                                <input
                                    id="address"
                                    type="text"
                                    {...formik.getFieldProps('address')}
                                    className={formik.touched.address && formik.errors.address ? 'error' : ''}
                                />
                                {formik.touched.address && formik.errors.address && (
                                    <div className="error-message">{formik.errors.address}</div>
                                )}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/seller/dashboard')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-save" disabled={loading}>
                                <FaSave /> {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellerProfilePage;
