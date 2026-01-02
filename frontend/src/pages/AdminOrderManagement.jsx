import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSearch, FaEye, FaEdit } from 'react-icons/fa';
import './AdminManagement.css';

const AdminOrderManagement = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders'); // Ensure this endpoint exists in backend/routes/orders.js
            setOrders(response.data.data.orders);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

        if (!newStatus || !validStatuses.includes(newStatus)) return;

        try {
            await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
            setOrders(orders.map(o =>
                o._id === orderId ? { ...o, orderStatus: newStatus } : o
            ));
            toast.success('Order status updated');
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = statusFilter === 'all' || order.orderStatus === statusFilter;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (order._id.toLowerCase().includes(searchLower) ||
            order.userId?.name?.toLowerCase().includes(searchLower) ||
            order.userId?.email?.toLowerCase().includes(searchLower));
        return matchesFilter && matchesSearch;
    });

    if (loading) return <Loader />;

    return (
        <div className="admin-management-container">
            <div className="management-header">

                <h1>Order Management</h1>
            </div>

            <div className="filters-bar">
                <div className="search-wrapper">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by ID, customer name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="status-filters">
                    <button className={statusFilter === 'all' ? 'active' : ''} onClick={() => setStatusFilter('all')}>All</button>
                    <button className={statusFilter === 'paid' ? 'active' : ''} onClick={() => setStatusFilter('paid')}>Paid</button>
                    <button className={statusFilter === 'shipped' ? 'active' : ''} onClick={() => setStatusFilter('shipped')}>Shipped</button>
                    <button className={statusFilter === 'delivered' ? 'active' : ''} onClick={() => setStatusFilter('delivered')}>Delivered</button>
                    <button className={statusFilter === 'cancelled' ? 'active' : ''} onClick={() => setStatusFilter('cancelled')}>Cancelled</button>
                </div>
            </div>

            <div className="table-responsive admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order._id}>
                                    <td>#{order._id.slice(-6).toUpperCase()}</td>
                                    <td>
                                        <div>{order.userId?.name}</div>
                                        <div style={{ fontSize: '0.8em', color: '#718096' }}>{order.userId?.email}</div>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 'bold' }}>{Math.round(order.grandTotal).toLocaleString()} Rwf</td>
                                    <td>
                                        <span className={`status-badge ${order.paymentStatus === 'paid' ? 'delivered' : 'pending'}`}>
                                            {order.paymentMethod.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${order.orderStatus}`}>
                                            {order.orderStatus.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="action-btn info"
                                            title="View Details"
                                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                                        >
                                            <FaEye />
                                        </button>
                                        <select
                                            className="status-select"
                                            value={order.orderStatus}
                                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data-cell">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrderManagement;
