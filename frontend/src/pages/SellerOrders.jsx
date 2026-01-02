import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { FaShoppingBag } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SellerOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/seller-orders');
            setOrders(response.data.data.orders);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled';
            case 'paid': return 'status-paid';
            default: return '';
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="seller-orders-page">
            <h1 className="page-title" style={{ marginBottom: '2rem' }}>Order Management</h1>

            {orders.length > 0 ? (
                <div className="orders-list-view" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {orders.map(order => (
                        <div key={order._id} className="order-list-item" style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr auto',
                            alignItems: 'center',
                            gap: '1rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <div className="order-info-group">
                                <strong style={{ display: 'block' }}>Order #{order._id.slice(-8).toUpperCase()}</strong>
                                <span style={{ fontSize: '0.85rem', color: '#718096' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="order-status-group">
                                <span className={`status-badge ${order.orderStatus}`} style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>{order.orderStatus.toUpperCase()}</span>
                            </div>
                            <div className="order-customer-group">
                                <span style={{ color: '#4a5568' }}>Customer: <strong>{order.userId?.name || 'Guest'}</strong></span>
                            </div>
                            <div className="order-price-group">
                                <strong style={{ fontSize: '1.1rem', color: '#2d3748' }}>
                                    {Math.round(order.grandTotal).toLocaleString()} Rwf
                                </strong>
                            </div>
                            <button
                                className="btn-secondary"
                                onClick={() => navigate(`/seller/orders/${order._id}`)}
                                style={{
                                    background: '#edf2f7',
                                    border: 'none',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Details
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px' }}>
                    <FaShoppingBag size={48} color="#cbd5e0" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: '#718096' }}>No orders found for your products.</p>
                </div>
            )}
        </div>
    );
};

export default SellerOrders;
