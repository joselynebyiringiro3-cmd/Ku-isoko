import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { FaBox, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SellerProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products/my-products');
            setProducts(response.data.data.products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${productId}`);
                setProducts(products.filter(p => p._id !== productId));
                toast.success('Product deleted successfully');
            } catch (error) {
                console.error('Failed to delete product', error);
                toast.error('Failed to delete product');
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="seller-products-page">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>My Products</h1>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/seller/products/new')}
                    style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600'
                    }}
                >
                    <FaPlus /> Add New Product
                </button>
            </div>

            <div className="products-grid-view" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
            }}>
                {products.length > 0 ? (
                    products.map(product => (
                        <div key={product._id} className="product-manage-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            transition: 'transform 0.3s'
                        }}>
                            <img
                                src={product.imageUrl?.startsWith('http') ? product.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.imageUrl}`}
                                alt={product.name}
                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            />
                            <div className="product-manage-info" style={{ padding: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{product.name}</h3>
                                <p className="price" style={{ color: '#667eea', fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>
                                    {Math.round(product.price).toLocaleString()} Rwf
                                </p>
                                <p className="stock" style={{ color: '#718096', margin: '0 0 1.5rem 0' }}>Stock: {product.stock}</p>
                                <div className="product-actions" style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        className="btn-icon edit"
                                        onClick={() => navigate(`/seller/products/edit/${product._id}`)}
                                        style={{ background: '#edf2f7', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', flex: 1 }}
                                    >
                                        <FaEdit color="#4a5568" /> Edit
                                    </button>
                                    <button
                                        className="btn-icon delete"
                                        onClick={() => handleDeleteProduct(product._id)}
                                        style={{ background: '#fff5f5', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', flex: 1 }}
                                    >
                                        <FaTrash color="#e53e3e" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-data-full" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px' }}>
                        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>You haven't added any products yet.</p>
                        <button className="btn-primary" onClick={() => navigate('/seller/products/new')}>Add Your First Product</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerProducts;
