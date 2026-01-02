import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FaUsers, FaStore, FaShoppingBag, FaBoxOpen, FaChartLine } from 'react-icons/fa';
import './AdminLayout.css';

const AdminLayout = () => {
    return (
        <div className="admin-layout-container">
            <div className="admin-sidebar">
                <h2>Admin Panel</h2>
                <nav>
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        <FaChartLine /> Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        <FaUsers /> Users
                    </NavLink>
                    <NavLink
                        to="/admin/sellers"
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        <FaStore /> Sellers
                    </NavLink>
                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        <FaBoxOpen /> Products
                    </NavLink>
                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        <FaShoppingBag /> Orders
                    </NavLink>
                </nav>
            </div>

            <div className="admin-content-area">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
