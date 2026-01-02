import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';
import { FaStar, FaShoppingCart, FaStore, FaPlus, FaMinus, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user, isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    // Review form
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: '',
    });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null);

    useEffect(() => {
        fetchProductDetails();
        fetchRelatedProducts();
        fetchReviews();
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${id}`);
            setProduct(response.data.data.product);
        } catch (error) {
            console.error('Failed to fetch product:', error);
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async () => {
        try {
            const response = await api.get(`/products/${id}/related`);
            setRelatedProducts(response.data.data.relatedProducts);
        } catch (error) {
            console.error('Failed to fetch related products:', error);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await api.get(`/reviews/products/${id}`);
            setReviews(response.data.data.reviews);
            setAverageRating(response.data.data.averageRating);
            setReviewCount(response.data.data.reviewCount);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        }
    };

    const handleAddToCart = async () => {
        // if (user?.role !== 'customer') { ... } // Removed or modified check
        if (user && user.role !== 'customer') {
            toast.error('Only customers can add items to cart');
            return;
        }

        const result = await addToCart(product._id, quantity, product);
        if (result.success) {
            setQuantity(1);
        }
    };

    const handleQuantityChange = (delta) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= product.stock) {
            setQuantity(newQuantity);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please login to write a review');
            navigate('/login');
            return;
        }

        if (user?.role !== 'customer') {
            toast.error('Only customers can write reviews');
            return;
        }

        try {
            setSubmittingReview(true);
            if (editingReviewId) {
                await api.put(`/reviews/${editingReviewId}`, reviewForm);
                toast.success('Review updated successfully!');
            } else {
                await api.post(`/reviews/products/${id}`, reviewForm);
                toast.success('Review submitted successfully!');
            }
            setReviewForm({ rating: 5, comment: '' });
            setEditingReviewId(null);
            fetchReviews();
            fetchProductDetails();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to submit review';
            toast.error(message);
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await api.delete(`/reviews/${reviewId}`);
                toast.success('Review deleted successfully');
                fetchReviews();
                fetchProductDetails();
            } catch (error) {
                toast.error('Failed to delete review');
            }
        }
    };

    const handleEditReview = (review) => {
        setEditingReviewId(review._id);
        setReviewForm({ rating: review.rating, comment: review.comment });
        // Scroll to form
        document.querySelector('.write-review-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setReviewForm({ rating: 5, comment: '' });
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={index < rating ? 'star-filled' : 'star-empty'}
            />
        ));
    };

    if (loading) {
        return <Loader />;
    }

    if (!product) {
        return (
            <div className="product-not-found">
                <h2>Product Not Found</h2>
                <button onClick={() => navigate('/')}>Back to Home</button>
            </div>
        );
    }

    return (
        <div className="product-detail-container">
            <div className="product-detail-wrapper">
                {/* Product Main Section */}
                <div className="product-main">
                    <div className="product-image-section">
                        <img
                            src={product.imageUrl?.startsWith('http') ? product.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.imageUrl}`}
                            alt={product.name}
                        />
                    </div>

                    <div className="product-info-section">
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-rating">
                            <div className="stars">
                                {renderStars(Math.round(averageRating))}
                            </div>
                            <span className="rating-text">
                                {averageRating.toFixed(1)} ({reviewCount} reviews)
                            </span>
                        </div>

                        <div className="product-price-section">
                            <span className="price">{Math.round(product.price).toLocaleString()} Rwf</span>
                            {product.stock > 0 ? (
                                <span className="stock in-stock">In Stock ({product.stock} available)</span>
                            ) : (
                                <span className="stock out-of-stock">Out of Stock</span>
                            )}
                        </div>

                        <div className="seller-info">
                            <FaStore className="store-icon" />
                            <div>
                                <strong>Sold by:</strong>
                                <span className="seller-name">
                                    {product.sellerId?.sellerProfile?.storeName || product.sellerId?.name}
                                </span>
                            </div>
                        </div>

                        <div className="product-category">
                            <strong>Category:</strong> {product.category}
                        </div>

                        {/* {product.stock > 0 && user?.role === 'customer' && ( */}
                        {product.stock > 0 && (!user || user.role === 'customer') && (
                            <div className="purchase-section">
                                <div className="quantity-selector">
                                    <label>Quantity:</label>
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            <FaMinus />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            readOnly
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= product.stock}
                                            aria-label="Increase quantity"
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>
                                </div>

                                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                                    <FaShoppingCart /> Add to Cart
                                </button>
                            </div>
                        )}

                        {/* {!isAuthenticated && product.stock > 0 && (
                            <button className="login-to-buy-btn" onClick={() => navigate('/login')}>
                                Login to Purchase
                            </button>
                        )} */}
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="product-tabs">
                    <div className="tab-headers">
                        <button
                            className={activeTab === 'description' ? 'active' : ''}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={activeTab === 'reviews' ? 'active' : ''}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews ({reviewCount})
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'description' && (
                            <div className="description-tab">
                                <h3>Product Description</h3>
                                <p>{product.description}</p>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="reviews-tab">
                                <div className="reviews-summary">
                                    <div className="average-rating">
                                        <h2>{averageRating.toFixed(1)}</h2>
                                        <div className="stars-large">
                                            {renderStars(Math.round(averageRating))}
                                        </div>
                                        <p>{reviewCount} reviews</p>
                                    </div>
                                </div>

                                {/* Write Review Form */}
                                {isAuthenticated && user?.role === 'customer' && (
                                    <div className="write-review-section">
                                        <h3>Write a Review</h3>
                                        <form onSubmit={handleReviewSubmit}>
                                            <div className="form-group">
                                                <label>Rating:</label>
                                                <div className="rating-input">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <FaStar
                                                            key={star}
                                                            className={star <= reviewForm.rating ? 'star-filled' : 'star-empty'}
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                            style={{ cursor: 'pointer', fontSize: '2rem' }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="comment">Comment:</label>
                                                <textarea
                                                    id="comment"
                                                    rows="4"
                                                    value={reviewForm.comment}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                    placeholder="Share your experience with this product..."
                                                />
                                            </div>

                                            <div className="form-actions">
                                                <button type="submit" className="submit-review-btn" disabled={submittingReview}>
                                                    {submittingReview ? 'Submitting...' : (editingReviewId ? 'Update Review' : 'Submit Review')}
                                                </button>
                                                {editingReviewId && (
                                                    <button type="button" className="cancel-edit-btn" onClick={handleCancelEdit}>
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Reviews List */}
                                <div className="reviews-list">
                                    <h3>Customer Reviews</h3>
                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review._id} className="review-item">
                                                <div className="review-header">
                                                    <strong>{review.userId?.name}</strong>
                                                    <div className="review-stars">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                </div>
                                                <p className="review-comment">{review.comment}</p>
                                                <div className="review-footer">
                                                    <span className="review-date">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {isAuthenticated && (
                                                        <div className="review-actions">
                                                            {user?._id === review.userId?._id && (
                                                                <button onClick={() => handleEditReview(review)} className="action-btn edit" title="Edit">
                                                                    <FaEdit />
                                                                </button>
                                                            )}
                                                            {(user?._id === review.userId?._id || user?.role === 'admin') && (
                                                                <button onClick={() => handleDeleteReview(review._id)} className="action-btn delete" title="Delete">
                                                                    <FaTrash />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-reviews">No reviews yet. Be the first to review!</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="related-products-section">
                        <h2>Related Products</h2>
                        <div className="related-products-grid">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct._id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
