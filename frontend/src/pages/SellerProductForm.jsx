import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import './SellerProductForm.css';

const SellerProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrl: '',
    });

    const categories = [
        'Electronics',
        'Fashion',
        'Home & Garden',
        'Beauty & Health',
        'Sports',
        'Books',
        'Toys',
        'Automotive',
        'Other'
    ];

    useEffect(() => {
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${id}`);
            const product = response.data.data.product;
            setInitialValues({
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                imageUrl: product.imageUrl,
            });
        } catch (error) {
            console.error('Failed to fetch product:', error);
            toast.error('Failed to load product details');
            navigate('/seller/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues,
        validationSchema: Yup.object({
            name: Yup.string().required('Product name is required'),
            description: Yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
            price: Yup.number().positive('Price must be positive').required('Price is required'),
            stock: Yup.number().integer('Stock must be an integer').min(0, 'Stock cannot be negative').required('Stock is required'),
            category: Yup.string().required('Category is required').oneOf(categories, 'Invalid category'),
            imageUrl: Yup.string().required('Image is required'),
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                if (isEditMode) {
                    await api.put(`/products/${id}`, values);
                    toast.success('Product updated successfully');
                } else {
                    await api.post('/products', values);
                    toast.success('Product created successfully');
                }
                navigate('/seller/dashboard');
            } catch (error) {
                console.error('Save failed:', error);
                toast.error(error.response?.data?.message || 'Failed to save product');
            } finally {
                setLoading(false);
            }
        },
    });

    if (loading && isEditMode && !initialValues.name) {
        return <Loader />;
    }

    return (
        <div className="product-form-container">
            <div className="form-wrapper">
                <div className="form-card">
                    <h1 className="form-title">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Product Name *</label>
                            <input
                                id="name"
                                type="text"
                                {...formik.getFieldProps('name')}
                                className={formik.touched.name && formik.errors.name ? 'error' : ''}
                                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                            />
                            {formik.touched.name && formik.errors.name && (
                                <div className="error-message">{formik.errors.name}</div>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="category">Category *</label>
                                <select
                                    id="category"
                                    {...formik.getFieldProps('category')}
                                    className={formik.touched.category && formik.errors.category ? 'error' : ''}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {formik.touched.category && formik.errors.category && (
                                    <div className="error-message">{formik.errors.category}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="price">Price (Rwf) *</label>
                                <input
                                    id="price"
                                    type="number"
                                    step="1"
                                    {...formik.getFieldProps('price')}
                                    className={formik.touched.price && formik.errors.price ? 'error' : ''}
                                    placeholder="0"
                                />
                                {formik.touched.price && formik.errors.price && (
                                    <div className="error-message">{formik.errors.price}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="stock">Stock *</label>
                                <input
                                    id="stock"
                                    type="number"
                                    {...formik.getFieldProps('stock')}
                                    className={formik.touched.stock && formik.errors.stock ? 'error' : ''}
                                    placeholder="0"
                                />
                                {formik.touched.stock && formik.errors.stock && (
                                    <div className="error-message">{formik.errors.stock}</div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="image">Product Image *</label>
                            <input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const formData = new FormData();
                                    formData.append('image', file);

                                    try {
                                        setLoading(true);
                                        const response = await api.post('/upload', formData, {
                                            headers: { 'Content-Type': 'multipart/form-data' }
                                        });
                                        formik.setFieldValue('imageUrl', response.data.data.url);
                                        toast.success('Image uploaded successfully');
                                    } catch (error) {
                                        console.error('Upload failed:', error);
                                        toast.error('Image upload failed');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className={formik.touched.imageUrl && formik.errors.imageUrl ? 'error' : ''}
                            />
                            {formik.touched.imageUrl && formik.errors.imageUrl && (
                                <div className="error-message">{formik.errors.imageUrl}</div>
                            )}
                            {formik.values.imageUrl && (
                                <div className="image-preview" style={{ marginTop: '1rem' }}>
                                    <img
                                        src={formik.values.imageUrl.startsWith('http') ? formik.values.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${formik.values.imageUrl}`}
                                        alt="Preview"
                                        style={{ maxWidth: '200px', borderRadius: '8px' }}
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                rows="6"
                                {...formik.getFieldProps('description')}
                                className={formik.touched.description && formik.errors.description ? 'error' : ''}
                                placeholder="Describe your product in detail..."
                            />
                            {formik.touched.description && formik.errors.description && (
                                <div className="error-message">{formik.errors.description}</div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/seller/dashboard')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-save" disabled={loading}>
                                <FaSave /> {loading ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellerProductForm;
