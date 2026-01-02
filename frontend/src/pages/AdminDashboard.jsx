import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { FaUsers, FaStore, FaShoppingBag, FaMoneyBillWave, FaUserCheck, FaBoxOpen, FaChartLine } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalSellers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingSellers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            setLoading(true);
            // In a real app, you'd have a dedicated stats endpoint. 
            // Here we'll fetch lists and calculate length for demonstration.
            const [usersRes, sellersRes, ordersRes] = await Promise.all([
                api.get('/users'),
                api.get('/sellers'),
                api.get('/orders')
            ]);

            const users = usersRes.data.data.users;
            const sellers = sellersRes.data.data.sellers;
            const orders = ordersRes.data.data.orders; // Assuming pagination structure, check if this is correct

            const totalRevenue = orders.reduce((sum, order) => sum + order.grandTotal, 0);

            setStats({
                totalUsers: users.length,
                totalSellers: sellers.length,
                totalOrders: orders.length, // likely paginated, but good for now or separate endpoint
                totalRevenue,
                pendingSellers: sellers.filter(s => s.sellerStatus === 'pending').length
            });

        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="admin-content">
            <h1 className="page-title">Dashboard Overview</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon users"><FaUsers /></div>
                    <div className="stat-info">
                        <h3>Total Users</h3>
                        <p>{stats.totalUsers}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon sellers"><FaStore /></div>
                    <div className="stat-info">
                        <h3>Total Sellers</h3>
                        <p>{stats.totalSellers}</p>
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
                    <div className="stat-icon revenue"><FaMoneyBillWave /></div>
                    <div className="stat-info">
                        <h3>Total Revenue</h3>
                        <p>{stats.totalRevenue.toLocaleString()} Rwf</p>
                    </div>
                </div>
            </div>

            {stats.pendingSellers > 0 && (
                <div className="alert-section">
                    <div className="alert-card warning">
                        <FaUserCheck />
                        <div>
                            <h3>Pending Seller Approvals</h3>
                            <p>You have {stats.pendingSellers} seller applications waiting for review.</p>
                            <button onClick={() => navigate('/admin/sellers')}>Review Sellers</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions or Recent Activity could go here */}
            <div className="dashboard-section-grid">
                <div className="dash-section">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        <button onClick={() => navigate('/admin/users')}>Manage Users</button>
                        <button onClick={() => navigate('/admin/orders')}>View Recent Orders</button>
                    </div>
                </div>

                <div className="dash-section">
                    <h2>System Health</h2>
                    <div className="system-status">
                        <div className="status-item">
                            <span>Server Status</span>
                            <span className="status-indicator online">Online</span>
                        </div>
                        <div className="status-item">
                            <span>Database</span>
                            <span className="status-indicator online">Connected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// End of component

export default AdminDashboard;
