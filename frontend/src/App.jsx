import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import SellerDashboard from './pages/SellerDashboard';
import SellerProductForm from './pages/SellerProductForm';
import SellerProfilePage from './pages/SellerProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminSellerManagement from './pages/AdminSellerManagement';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminOrderManagement from './pages/AdminOrderManagement';
import AdminProductManagement from './pages/AdminProductManagement';
import SellerProducts from './pages/SellerProducts';
import SellerOrders from './pages/SellerOrders';
import AdminLayout from './components/AdminLayout';
import SellerLayout from './components/SellerLayout';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import BecomeSeller from './pages/BecomeSeller';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import GoogleSuccess from './pages/GoogleSuccess';
import './App.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <div className="app">
                        <Header />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/products" element={<ProductsPage />} />
                                <Route path="/products/:id" element={<ProductDetail />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                                <Route path="/verify-email" element={<VerifyEmail />} />
                                <Route path="/become-seller" element={
                                    <ProtectedRoute>
                                        <BecomeSeller />
                                    </ProtectedRoute>
                                } />
                                <Route path="/about" element={<About />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/terms" element={<TermsOfService />} />
                                <Route path="/auth/google/success" element={<GoogleSuccess />} />

                                {/* Customer Routes */}
                                <Route path="/cart" element={<Cart />} />
                                <Route
                                    path="/checkout"
                                    element={
                                        <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
                                            <Checkout />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/orders"
                                    element={
                                        <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
                                            <OrderHistory />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/orders/:id"
                                    element={
                                        <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
                                            <OrderDetail />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Seller Routes (Wrapped in SellerLayout) */}
                                <Route
                                    path="/seller"
                                    element={
                                        <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
                                            <SellerLayout />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route path="dashboard" element={<SellerDashboard />} />
                                    <Route path="products" element={<SellerProducts />} />
                                    <Route path="products/new" element={<SellerProductForm />} />
                                    <Route path="products/edit/:id" element={<SellerProductForm />} />
                                    <Route path="orders" element={<SellerOrders />} />
                                    <Route path="orders/:id" element={<OrderDetail />} />
                                    <Route path="profile" element={<SellerProfilePage />} />
                                </Route>

                                {/* Admin Routes (Wrapped in AdminLayout) */}
                                <Route
                                    path="/admin"
                                    element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                            <AdminLayout />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="sellers" element={<AdminSellerManagement />} />
                                    <Route path="users" element={<AdminUserManagement />} />
                                    <Route path="orders" element={<AdminOrderManagement />} />
                                    <Route path="orders/:id" element={<OrderDetail />} />
                                    <Route path="products" element={<AdminProductManagement />} />
                                </Route>
                            </Routes>
                        </main>
                        <Footer />
                        <ToastContainer
                            position="top-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                        />
                    </div>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
