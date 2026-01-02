import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCheck, FaBan, FaSearch, FaUserShield, FaUserTag } from 'react-icons/fa';
import './AdminManagement.css';

const AdminUserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state would be managed here in a real large-scale app
    // For now, client-side filtering on the fetched list

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users?limit=100'); // Fetching a batch for now
            setUsers(response.data.data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            await api.patch(`/users/${userId}/active`);
            // Optimistic update
            setUsers(users.map(u =>
                u._id === userId ? { ...u, isActive: !currentStatus } : u
            ));
            toast.success(`User ${action}d successfully`);
        } catch (error) {
            console.error('Toggle failed:', error);
            toast.error('Failed to update user status');
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        if (!newRole || !['customer', 'seller', 'admin'].includes(newRole)) return;

        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            setUsers(users.map(u =>
                u._id === userId ? { ...u, role: newRole } : u
            ));
            toast.success('User role updated');
        } catch (error) {
            console.error('Role update failed:', error);
            toast.error('Failed to update role');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesFilter = roleFilter === 'all' || user.role === roleFilter;
        const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    if (loading) return <Loader />;

    return (
        <div className="admin-management-container">
            <div className="management-header">

                <h1>User Management</h1>
            </div>

            <div className="filters-bar">
                <div className="search-wrapper">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="status-filters">
                    <button className={roleFilter === 'all' ? 'active' : ''} onClick={() => setRoleFilter('all')}>All</button>
                    <button className={roleFilter === 'customer' ? 'active' : ''} onClick={() => setRoleFilter('customer')}>Clients</button>
                    <button className={roleFilter === 'seller' ? 'active' : ''} onClick={() => setRoleFilter('seller')}>Sellers</button>
                    <button className={roleFilter === 'admin' ? 'active' : ''} onClick={() => setRoleFilter('admin')}>Admins</button>
                </div>
            </div>

            <div className="table-responsive admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="store-cell">
                                            <div className="store-avatar-small">{user.name?.charAt(0)}</div>
                                            <span>{user.name}</span>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`status-badge ${user.role}`}>
                                            {user.role === 'customer' ? 'CLIENT' : user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.isActive ? 'delivered' : 'cancelled'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <select
                                            className="role-select"
                                            value={user.role}
                                            onChange={(e) => handleChangeRole(user._id, e.target.value)}
                                        >
                                            <option value="customer">Client</option>
                                            <option value="seller">Seller</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        {user.isActive ? (
                                            <button
                                                className="action-btn warning"
                                                title="Deactivate"
                                                onClick={() => handleToggleActive(user._id, true)}
                                            >
                                                <FaBan />
                                            </button>
                                        ) : (
                                            <button
                                                className="action-btn success"
                                                title="Activate"
                                                onClick={() => handleToggleActive(user._id, false)}
                                            >
                                                <FaCheck />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-data-cell">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUserManagement;
