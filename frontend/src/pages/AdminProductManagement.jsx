import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSearch, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import Modal from '../components/Modal';
import './AdminManagement.css';

const AdminProductManagement = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Assuming we have an endpoint to get all products without pagination for now, or using the public one with high limit
            // Since admins should see everything, maybe we need a specific admin endpoint or just use public one
            // The productController's getProducts is public but respects filters.
            const response = await api.get('/products?limit=100');
            setProducts(response.data.data.products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!selectedProductId) return;

        try {
            await api.delete(`/products/${selectedProductId}`);
            setProducts(products.filter(p => p._id !== selectedProductId));
            toast.success('Product deleted successfully');
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete product');
        }
    };

    const confirmDelete = (productId) => {
        setSelectedProductId(productId);
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (product.name?.toLowerCase().includes(searchLower) ||
            product.category?.toLowerCase().includes(searchLower) ||
            product.sellerId?.name?.toLowerCase().includes(searchLower));
        return matchesSearch;
    });

    if (loading) return <Loader />;

    return (
        <div className="admin-management-container">
            <div className="management-header">

                <h1>Product Management</h1>
            </div>

            <div className="filters-bar">
                <div className="search-wrapper">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by product, category or seller..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-responsive admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Seller</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <tr key={product._id}>
                                    <td className="store-cell">
                                        <img
                                            src={product.imageUrl?.startsWith('http') ? product.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.imageUrl}`}
                                            alt={product.name}
                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                        <span title={product.name} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {product.name}
                                        </span>
                                    </td>
                                    <td>{product.category}</td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{product.sellerId?.sellerProfile?.storeName || product.sellerId?.name || 'Unknown'}</div>
                                    </td>
                                    <td>{Math.round(product.price).toLocaleString()} Rwf</td>
                                    <td>
                                        <span className={`status-badge ${product.stock > 0 ? 'delivered' : 'cancelled'}`}>
                                            {product.stock > 0 ? product.stock : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="action-btn info"
                                            title="View Public Page"
                                            onClick={() => navigate(`/products/${product._id}`)}
                                        >
                                            <FaExternalLinkAlt />
                                        </button>
                                        <button
                                            className="action-btn danger"
                                            title="Delete Product"
                                            onClick={() => confirmDelete(product._id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data-cell">No products found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDeleteProduct}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default AdminProductManagement;
