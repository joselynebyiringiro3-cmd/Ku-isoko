import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { FaBox, FaShoppingBag, FaChartLine, FaPlus, FaEdit, FaTrash, FaStore, FaBan } from 'react-icons/fa';
import './SellerDashboard.css';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [sellerStatus, setSellerStatus] = useState('active');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Check seller status first
            const profileRes = await api.get('/sellers/profile/me');
            const seller = profileRes.data.data.seller;
            const status = seller ? seller.sellerStatus : 'none';
            setSellerStatus(status);

            if (status !== 'active') {
                setLoading(false);
                return;
            }

            // Fetch products
            const productsRes = await api.get('/products/my-products');
            setProducts(productsRes.data.data.products);

            // Fetch orders
            const ordersRes = await api.get('/orders/seller-orders');
            const orders = ordersRes.data.data.orders;
            setRecentOrders(orders.slice(0, 5));

            // Calculate stats
            const revenue = orders.reduce((acc, order) => {
                // Calculate revenue only for items belonging to this seller
                const orderRevenue = order.items
                    .filter(item => item.sellerId === user._id || item.sellerId?._id === user._id)
                    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
                return acc + orderRevenue;
            }, 0);

            setStats({
                totalProducts: productsRes.data.data.products.length,
                totalOrders: ordersRes.data.results, // Assuming API returns count
                totalRevenue: revenue,
                pendingOrders: orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length
            });

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${productId}`);
                setProducts(products.filter(p => p._id !== productId));
                setStats(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
            } catch (error) {
                console.error('Failed to delete product', error);
            }
        }
    };

    if (loading) return <Loader />;

    if (sellerStatus === 'blocked') {
        return (
            <div className="overview-section">
                <div className="pending-status-card blocked">
                    <FaBan className="pending-icon" style={{ color: '#f56565' }} />
                    <h2 style={{ color: '#c53030' }}>Account Suspended</h2>
                    <p>Your seller account has been suspended by the administration.</p>
                    <p>Please contact support if you believe this is a mistake.</p>
                </div>
            </div>
        );
    }

    if (sellerStatus === 'none') {
        return (
            <div className="overview-section">
                <div className="pending-status-card">
                    <FaStore className="pending-icon" />
                    <h2>Start Your Selling Journey</h2>
                    <p>You haven't requested to become a seller yet.</p>
                    <button className="btn-primary" onClick={() => navigate('/become-seller')}>
                        Register Now
                    </button>
                </div>
            </div>
        );
    }

    if (sellerStatus !== 'active') {
        return (
            <div className="overview-section">
                <div className="pending-status-card">
                    <FaStore className="pending-icon" />
                    <h2>Account Pending Approval</h2>
                    <p>Your seller account is currently being reviewed by our administration team.</p>
                    <p>You will be able to manage products and view orders once your account is activated.</p>
                    <div className="pending-steps">
                        <div className="step">
                            <span className="step-number">1</span>
                            <span className="step-text">Request Submitted</span>
                        </div>
                        <div className="step current">
                            <span className="step-number">2</span>
                            <span className="step-text">Under Review</span>
                        </div>
                        <div className="step">
                            <span className="step-number">3</span>
                            <span className="step-text">Start Selling</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="overview-section">
            <h1 className="page-title">Seller Overview</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon revenue"><FaChartLine /></div>
                    <div className="stat-info">
                        <h3>Total Revenue</h3>
                        <p>{Math.round(stats.totalRevenue).toLocaleString()} Rwf</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orders"><FaShoppingBag /></div>
                    <div className="stat-info">
                        <h3>Total Orders</h3>
                        <p>{stats.totalOrders}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon products"><FaBox /></div>
                    <div className="stat-info">
                        <h3>Total Products</h3>
                        <p>{stats.totalProducts}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon pending"><FaShoppingBag /></div>
                    <div className="stat-info">
                        <h3>Pending Orders</h3>
                        <p>{stats.pendingOrders}</p>
                    </div>
                </div>
            </div>

            <div className="recent-orders-preview">
                <h2>Recent Orders</h2>
                {recentOrders.length > 0 ? (
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(order => (
                                <tr key={order._id}>
                                    <td>#{order._id.slice(-6).toUpperCase()}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>{order.userId?.name || 'Guest'}</td>
                                    <td><span className={`status-badge ${order.orderStatus}`}>{order.orderStatus}</span></td>
                                    <td>{Math.round(order.grandTotal).toLocaleString()} Rwf</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No orders yet.</p>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;

