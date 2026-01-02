import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            setLoading(true);
            // Fetch products without filters to get "Featured" (or just latest)
            const response = await api.get('/products?limit=8');
            setFeaturedProducts(response.data.data.products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Welcome to Ku-isoko</h1>
                    <p>Discover quality products from trusted sellers</p>
                    <button className="cta-btn" onClick={() => navigate('/products')}>
                        Start Shopping
                    </button>
                </div>
            </section>

            <div className="content-wrapper">
                <section className="products-section">
                    <h2>Featured Products</h2>

                    {loading ? (
                        <Loader />
                    ) : featuredProducts.length > 0 ? (
                        <div className="products-grid">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-products">
                            <p>No products available at the moment.</p>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <button className="cta-btn" onClick={() => navigate('/products')}>
                            View All Products
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
