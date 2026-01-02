import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaStore, FaUserShield, FaSearch, FaChevronDown } from 'react-icons/fa';
import './Header.css';

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller');
    const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname);

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <h1>Ku-isoko</h1>
                </Link>

                {!isDashboard && (
                    <nav className="nav-links">
                        <Link to="/products">Products</Link>
                        <Link to="/about">About Us</Link>
                        <Link to="/contact">Contact</Link>
                        {(!isAuthPage && (!user || user.role === 'customer')) && (
                            <Link to="/become-seller" className="become-seller-link">
                                Become a Seller
                            </Link>
                        )}
                        {user?.role === 'seller' && (
                            <Link to="/seller/dashboard">
                                <FaStore /> Dashboard
                            </Link>
                        )}
                        {user?.role === 'admin' && (
                            <Link to="/admin/dashboard">
                                <FaUserShield /> Admin
                            </Link>
                        )}
                    </nav>
                )}

                {(!isDashboard && !isAuthPage) && (
                    <div className="search-bar-container">
                        <div className="category-dropdown-container">
                            <button className="category-btn">
                                Categories <FaChevronDown />
                            </button>
                            <div className="category-menu">
                                <div className="category-menu-content">
                                    <Link to="/products?category=Electronics">Electronics</Link>
                                    <Link to="/products?category=Fashion">Fashion</Link>
                                    <Link to="/products?category=Home">Home</Link>
                                    <Link to="/products?category=Beauty">Beauty</Link>
                                    <Link to="/products?category=Sports">Sports</Link>
                                    <Link to="/products?category=Books">Books</Link>
                                </div>
                            </div>
                        </div>
                        <form onSubmit={handleSearchSubmit} className="header-search-form">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit">
                                <FaSearch />
                            </button>
                        </form>
                    </div>
                )}

                <div className="header-actions">
                    {/* Show Cart for Guests and Clients (not Admins) */}
                    {user?.role !== 'admin' && (
                        <Link to="/cart" className="cart-icon">
                            <FaShoppingCart />
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </Link>
                    )}

                    {isAuthenticated ? (
                        <div className="user-menu">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="user-avatar" />
                            ) : (
                                <div className="user-avatar-placeholder"><FaUser /></div>
                            )}
                            <span className="user-name-text">{user?.name}</span>
                            <FaChevronDown className="chevron-icon" />
                            <div className="dropdown">
                                <div className="dropdown-content">
                                    <div className="dropdown-header">
                                        <strong>{user?.name}</strong>
                                        <span className="user-role-badge">
                                            {user?.role === 'customer' ? 'CLIENT' : user?.role}
                                        </span>
                                    </div>
                                    <div className="dropdown-divider"></div>

                                    {user?.role === 'seller' && (
                                        <>
                                            <Link to="/seller/profile">Store Profile</Link>
                                            <Link to="/orders">My Orders</Link>
                                            <Link to="/seller/dashboard" className="special-link">
                                                <FaStore /> Seller Dashboard
                                            </Link>
                                        </>
                                    )}

                                    {user?.role === 'customer' && (
                                        <Link to="/orders">My Orders</Link>
                                    )}

                                    <div className="dropdown-divider"></div>
                                    <button onClick={handleLogout} className="logout-btn">
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn-link">Login</Link>
                            <Link to="/signup" className="btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
