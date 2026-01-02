import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCheck, FaTimes, FaBan, FaSearch, FaEye } from 'react-icons/fa';
import './AdminManagement.css'; // Reusing a common CSS file for admin tables

const AdminSellerManagement = () => {
    const navigate = useNavigate();
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, active, blocked
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSellers();
    }, []);

    const fetchSellers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/sellers');
            setSellers(response.data.data.sellers);
        } catch (error) {
            console.error('Failed to fetch sellers:', error);
            toast.error('Failed to load sellers');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (sellerId, newStatus) => {
        if (!newStatus) return;

        try {
            await api.put(`/sellers/${sellerId}/status`, { status: newStatus });
            toast.success(`Seller status updated to ${newStatus}`);
            // Optimistic update
            setSellers(sellers.map(s =>
                s._id === sellerId ? { ...s, sellerStatus: newStatus } : s
            ));
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredSellers = sellers.filter(seller => {
        const matchesFilter = filter === 'all' || seller.sellerStatus === filter;
        const matchesSearch = (seller.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    if (loading) return <Loader />;

    return (
        <div className="admin-management-container">
            <div className="management-header">

                <h1>Seller Management</h1>
            </div>

            <div className="filters-bar">
                <div className="search-wrapper">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by store, name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="status-filters">
                    <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                    <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
                    <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
                    <button className={filter === 'blocked' ? 'active' : ''} onClick={() => setFilter('blocked')}>Rejected</button>
                </div>
            </div>

            <div className="table-responsive admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Store Name</th>
                            <th>User</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSellers.length > 0 ? (
                            filteredSellers.map(seller => (
                                <tr key={seller._id}>
                                    <td className="store-cell">
                                        <div className="store-avatar-small">{seller.storeName?.charAt(0)}</div>
                                        <span>{seller.storeName}</span>
                                    </td>
                                    <td>{seller.userId?.name}</td>
                                    <td>{seller.userId?.email}</td>
                                    <td>{seller.phone}</td>
                                    <td>
                                        <span className={`status-badge ${seller.sellerStatus}`}>
                                            {seller.sellerStatus.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <select
                                            className="status-select"
                                            value={seller.sellerStatus}
                                            onChange={(e) => handleStatusUpdate(seller._id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="active">Active</option>
                                            <option value="blocked">Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data-cell">No sellers found matching criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSellerManagement;
