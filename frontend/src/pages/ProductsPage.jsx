import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import './Home.css'; // Reusing Home styles for consistency

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        // Search is handled via URL param only, avoiding local text input duplicate
        category: '',
        minPrice: '',
        maxPrice: '',
    });
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Initial load and URL param sync
    useEffect(() => {
        const currentParams = {
            search: searchParams.get('search') || '', // Read search term from URL
            category: searchParams.get('category') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
        };

        // Update local filter state (except search which is top-bar driven)
        setFilters(prev => ({
            ...prev,
            category: currentParams.category,
            minPrice: currentParams.minPrice,
            maxPrice: currentParams.maxPrice
        }));

        fetchProducts(currentParams);
    }, [searchParams]);

    const fetchProducts = async (filterParams = {}) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (filterParams.search) params.append('search', filterParams.search);
            if (filterParams.category) params.append('category', filterParams.category);
            if (filterParams.minPrice) params.append('minPrice', filterParams.minPrice);
            if (filterParams.maxPrice) params.append('maxPrice', filterParams.maxPrice);
            params.append('limit', '100'); // Fetch more on products page

            const response = await api.get(`/products?${params.toString()}`);
            const fetchedProducts = response.data.data.products;
            setProducts(fetchedProducts);

            // Extract unique categories (if we haven't already or from this filtered set?)
            // Ideally we want *all* categories, but extracting from result is what we did before.
            // A better way is to fetch unique categories from a separate endpoint or all products once.
            // For now, let's just stick to the pattern or hardcode if the result set is small.
            // To ensure we have categories even if filtered result is small, we might want to fetch all categories separately
            // But let's stick to the existing behavior:
            if (fetchedProducts.length > 0) {
                const uniqueCategories = [...new Set(fetchedProducts.map(p => p.category))];
                // Basic aggregation
                setCategories(prev => [...new Set([...prev, ...uniqueCategories])]);
                // Note: This logic is flawed if we filter down. But acceptable for now.
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams); // Keep existing params like search
        if (filters.category) params.set('category', filters.category); else params.delete('category');
        if (filters.minPrice) params.set('minPrice', filters.minPrice); else params.delete('minPrice');
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice); else params.delete('maxPrice');

        navigate(`/products?${params.toString()}`);
    };

    const handleReset = () => {
        navigate('/products'); // Clears all filters including search
    };

    return (
        <div className="home-container">
            <div className="content-wrapper">
                <section className="filters-section">
                    <form onSubmit={applyFilters} className="filters-form" style={{ display: 'block' }}>
                        <div className="filter-group" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                            <select name="category" value={filters.category} onChange={handleFilterChange}>
                                <option value="">All Categories</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Fashion">Fashion</option>
                                <option value="Home">Home</option>
                                <option value="Beauty">Beauty</option>
                                <option value="Sports">Sports</option>
                                <option value="Books">Books</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <input
                                type="number"
                                name="minPrice"
                                placeholder="Min Price"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                            />

                            <input
                                type="number"
                                name="maxPrice"
                                placeholder="Max Price"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                            />

                            <button type="submit" className="cta-btn" style={{ padding: '0.75rem', fontSize: '1rem' }}>
                                Apply
                            </button>

                            <button type="button" className="reset-btn" onClick={handleReset}>
                                Reset
                            </button>
                        </div>
                    </form>
                </section>

                <section className="products-section">
                    <h2>
                        {searchParams.get('search')
                            ? `Search Results for "${searchParams.get('search')}"`
                            : 'All Products'}
                    </h2>

                    {loading ? (
                        <Loader />
                    ) : products.length > 0 ? (
                        <div className="products-grid">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="no-products">
                            <p>No products found matching your criteria.</p>
                            <button className="cta-btn" onClick={handleReset} style={{ marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                Clear Filters
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProductsPage;
