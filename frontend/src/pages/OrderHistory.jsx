import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { FaBox, FaEye, FaCheckCircle, FaTruck, FaTimesCircle } from 'react-icons/fa';
import './OrderHistory.css';

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    });

    useEffect(() => {
        fetchOrders();
    }, [pagination.page]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/my-orders?page=${pagination.page}&limit=${pagination.limit}`);
            setOrders(response.data.data.orders);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <FaCheckCircle className="status-icon success" />;
            case 'shipped':
            case 'in_transit':
                return <FaTruck className="status-icon info" />;
            case 'cancelled':
                return <FaTimesCircle className="status-icon danger" />;
            default:
                return <FaBox className="status-icon warning" />;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'delivered':
                return 'badge-success';
            case 'shipped':
            case 'in_transit':
                return 'badge-info';
            case 'cancelled':
                return 'badge-danger';
            case 'paid':
                return 'badge-success';
            default:
                return 'badge-warning';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading && orders.length === 0) {
        return <Loader />;
    }

    return (
        <div className="order-history-container">
            <div className="order-history-wrapper">
                <h1 className="page-title">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="no-orders">
                        <FaBox className="no-orders-icon" />
                        <h2>No orders yet</h2>
                        <p>Start shopping to see your orders here!</p>
                        <button onClick={() => navigate('/')}>Start Shopping</button>
                    </div>
                ) : (
                    <>
                        <div className="orders-list">
                            {orders.map((order) => (
                                <div key={order._id} className="order-card">
                                    <div className="order-header">
                                        <div className="order-info">
                                            <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                                            <span className="order-date">{formatDate(order.createdAt)}</span>
                                        </div>
                                        <div className="order-status-badges">
                                            <span className={`badge ${getStatusClass(order.paymentStatus)}`}>
                                                {order.paymentStatus.toUpperCase()}
                                            </span>
                                            <span className={`badge ${getStatusClass(order.orderStatus)}`}>
                                                {order.orderStatus.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="order-body">
                                        <div className="order-items">
                                            {order.items.slice(0, 3).map((item, index) => (
                                                <div key={index} className="order-item-preview">
                                                    <img src={item.imageUrl} alt={item.name} />
                                                    <div className="item-info">
                                                        <p className="item-name">{item.name}</p>
                                                        <p className="item-qty">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className="more-items">
                                                    +{order.items.length - 3} more items
                                                </div>
                                            )}
                                        </div>

                                        <div className="order-details">
                                            <div className="detail-row">
                                                <span>Payment Method:</span>
                                                <strong>{order.paymentMethod.toUpperCase()}</strong>
                                            </div>
                                            <div className="detail-row">
                                                <span>Shipping Status:</span>
                                                <div className="shipping-status">
                                                    {getStatusIcon(order.shippingStatus)}
                                                    <strong>{order.shippingStatus.replace('_', ' ').toUpperCase()}</strong>
                                                </div>
                                            </div>
                                            <div className="detail-row total">
                                                <span>Total:</span>
                                                <strong className="total-amount">{Math.round(order.grandTotal).toLocaleString()} Rwf</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="order-footer">
                                        <button
                                            className="view-details-btn"
                                            onClick={() => navigate(`/orders/${order._id}`)}
                                        >
                                            <FaEye /> View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page === 1}
                                    className="pagination-btn"
                                >
                                    Previous
                                </button>
                                <span className="pagination-info">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page === pagination.pages}
                                    className="pagination-btn"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
