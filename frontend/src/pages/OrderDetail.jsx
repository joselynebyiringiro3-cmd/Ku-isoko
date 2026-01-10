import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { FaArrowLeft, FaBox, FaTruck, FaCheckCircle, FaStore, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import './OrderDetail.css';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data.data.order);
        } catch (error) {
            console.error('Failed to fetch order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!selectedReviewId) return;
        try {
            await api.delete(`/reviews/${selectedReviewId}`);
            toast.success('Review deleted successfully');
            fetchOrderDetails(); // Refresh reviews
            setIsModalOpen(false); // Close modal after deletion
            setSelectedReviewId(null); // Clear selected review
        } catch (error) {
            console.error('Failed to delete review:', error);
            toast.error('Failed to delete review');
        }
    };

    const confirmDeleteReview = (reviewId) => {
        setSelectedReviewId(reviewId);
        setIsModalOpen(true);
    };

    const handleUpdateStatus = async (field, value) => {
        try {
            setUpdating(true);
            const payload = { [field]: value };
            await api.put(`/orders/${id}/status`, payload);
            setOrder({ ...order, [field]: value });
            toast.success(`Order ${field} updated to ${value}`);
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'delivered':
            case 'paid':
                return 'badge-success';
            case 'shipped':
            case 'in_transit':
                return 'badge-info';
            case 'cancelled':
            case 'failed':
                return 'badge-danger';
            default:
                return 'badge-warning';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return <Loader />;
    }

    if (!order) {
        return (
            <div className="order-not-found">
                <h2>Order Not Found</h2>
                <button onClick={() => navigate('/orders')}>Back to Orders</button>
            </div>
        );
    }

    // Group items by seller
    const itemsBySeller = order.items.reduce((acc, item) => {
        const sellerId = item.sellerId?._id || 'unknown';
        if (!acc[sellerId]) {
            acc[sellerId] = {
                sellerName: item.sellerId?.name || 'Unknown Seller',
                items: [],
            };
        }
        acc[sellerId].items.push(item);
        return acc;
    }, {});

    return (
        <div className="order-detail-container">
            <div className="order-detail-wrapper">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>

                <div className="order-detail-header">
                    <div>
                        <h1 className="order-title">
                            Order #{order._id.slice(-8).toUpperCase()}
                        </h1>
                        <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                        {user?.role === 'admin' && (
                            <p className="customer-info">Customer: <strong>{order.userId?.name}</strong> ({order.userId?.email})</p>
                        )}
                    </div>
                    <div className="status-badges">
                        <span className={`badge ${getStatusBadgeClass(order.paymentStatus)}`}>
                            Payment: {order.paymentStatus.toUpperCase()}
                        </span>
                        <span className={`badge ${getStatusBadgeClass(order.orderStatus)}`}>
                            Order: {order.orderStatus.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="order-detail-content">
                    {/* Order Items by Seller */}
                    <div className="order-items-section">
                        <h2>Order Items</h2>

                        {Object.entries(itemsBySeller).map(([sellerId, sellerData]) => (
                            <div key={sellerId} className="seller-group">
                                <div className="seller-header">
                                    <FaStore />
                                    <strong>{sellerData.sellerName}</strong>
                                </div>

                                <div className="items-list">
                                    {sellerData.items.map((item, index) => (
                                        <div key={index} className="order-item">
                                            <img
                                                src={item.imageUrl?.startsWith('http') ? item.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.imageUrl}`}
                                                alt={item.name}
                                            />
                                            <div className="item-details">
                                                <h3>{item.name}</h3>
                                                <p className="item-price">{Math.round(item.price).toLocaleString()} Rwf × {item.quantity}</p>
                                                {item.review && (
                                                    <div className="item-review-info">
                                                        <p>Your Review: "{item.review.comment}" ({item.review.rating} stars)</p>
                                                        {user?.role === 'admin' && (
                                                            <button
                                                                className="delete-review-btn"
                                                                onClick={() => confirmDeleteReview(item.review._id)}
                                                            >
                                                                Delete Review
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="item-total">
                                                {Math.round(item.price * item.quantity).toLocaleString()} Rwf
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="order-sidebar">
                        {/* Admin Controls */}
                        {user?.role === 'admin' && (
                            <div className="sidebar-section admin-actions">
                                <h3><FaEdit /> Admin Management</h3>
                                <div className="admin-status-control">
                                    <label>Order Status:</label>
                                    <select
                                        value={order.orderStatus}
                                        onChange={(e) => handleUpdateStatus('orderStatus', e.target.value)}
                                        disabled={updating}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="admin-status-control">
                                    <label>Payment Status:</label>
                                    <select
                                        value={order.paymentStatus}
                                        onChange={(e) => handleUpdateStatus('paymentStatus', e.target.value)}
                                        disabled={updating}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                                <div className="admin-status-control">
                                    <label>Shipping Status:</label>
                                    <select
                                        value={order.shippingStatus}
                                        onChange={(e) => handleUpdateStatus('shippingStatus', e.target.value)}
                                        disabled={updating}
                                    >
                                        <option value="not_shipped">Not Shipped</option>
                                        <option value="in_transit">In Transit</option>
                                        <option value="delivered">Delivered</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Order Summary */}
                        <div className="sidebar-section">
                            <h3>Order Summary</h3>
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <strong>{Math.round(order.totalPrice).toLocaleString()} Rwf</strong>
                            </div>
                            <div className="summary-row">
                                <span>Shipping:</span>
                                <strong>
                                    {order.shippingFee === 0 ? 'FREE' : `${Math.round(order.shippingFee).toLocaleString()} Rwf`}
                                </strong>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <strong>{Math.round(order.grandTotal).toLocaleString()} Rwf</strong>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="sidebar-section">
                            <h3>Payment Information</h3>
                            <div className="info-row">
                                <span>Method:</span>
                                <strong>{order.paymentMethod.toUpperCase()}</strong>
                            </div>
                            {order.momoTransactionId && (
                                <div className="info-row">
                                    <span>Transaction ID:</span>
                                    <code>{order.momoTransactionId}</code>
                                </div>
                            )}
                            {order.stripePaymentId && (
                                <div className="info-row">
                                    <span>Payment ID:</span>
                                    <code>{order.stripePaymentId}</code>
                                </div>
                            )}
                        </div>

                        {/* Shipping Information */}
                        <div className="sidebar-section">
                            <h3>Shipping Address</h3>
                            <div className="shipping-address">
                                <p><strong>{order.shippingAddress.fullName}</strong></p>
                                <p>{order.shippingAddress.addressLine}</p>
                                <p>{order.shippingAddress.city}</p>
                                <p>Phone: {order.shippingAddress.phone}</p>
                            </div>
                        </div>

                        {/* Shipping Status */}
                        <div className="sidebar-section">
                            <h3>Shipping Timeline</h3>
                            <div className="shipping-timeline">
                                <div className={`timeline-item ${['pending', 'paid', 'shipped', 'delivered'].includes(order.orderStatus) ? 'completed' : ''}`}>
                                    <FaCheckCircle className="timeline-icon" />
                                    <span>Order Placed</span>
                                </div>
                                <div className={`timeline-item ${['paid', 'shipped', 'delivered'].includes(order.orderStatus) ? 'completed' : ''}`}>
                                    <FaCheckCircle className="timeline-icon" />
                                    <span>Payment Confirmed</span>
                                </div>
                                <div className={`timeline-item ${['shipped', 'delivered'].includes(order.orderStatus) || order.shippingStatus === 'in_transit' ? 'completed' : ''}`}>
                                    <FaTruck className="timeline-icon" />
                                    <span>In Transit</span>
                                </div>
                                <div className={`timeline-item ${order.orderStatus === 'delivered' || order.shippingStatus === 'delivered' ? 'completed' : ''}`}>
                                    <FaBox className="timeline-icon" />
                                    <span>Delivered</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDeleteReview}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default OrderDetail;
