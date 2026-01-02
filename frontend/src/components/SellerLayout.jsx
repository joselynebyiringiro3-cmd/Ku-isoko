import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { FaBox, FaShoppingBag, FaChartLine, FaStore } from 'react-icons/fa';
import api from '../services/api';
import Loader from './Loader';
import './SellerLayout.css';

const SellerLayout = () => {
    const [sellerStatus, setSellerStatus] = useState('active');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await api.get('/sellers/profile/me');
                const seller = response.data.data.seller;
                setSellerStatus(seller ? seller.sellerStatus : 'none');
            } catch (error) {
                console.error('Failed to check seller status', error);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, []);

    if (loading) return <Loader />;
    return (
        <div className="seller-layout-container">
            <div className="seller-sidebar">
                <h2>Seller Hub</h2>
                <nav>
                    <NavLink
                        to="/seller/dashboard"
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        <FaChartLine /> Overview
                    </NavLink>
                    {sellerStatus === 'active' && (
                        <>
                            <NavLink
                                to="/seller/products"
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                <FaBox /> My Products
                            </NavLink>
                            <NavLink
                                to="/seller/orders"
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                <FaShoppingBag /> Orders
                            </NavLink>
                        </>
                    )}
                    <NavLink
                        to="/seller/profile"
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        <FaStore /> Store Profile
                    </NavLink>
                </nav>
            </div>

            <div className="seller-content-area">
                <div className="seller-content-wrapper">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SellerLayout;
