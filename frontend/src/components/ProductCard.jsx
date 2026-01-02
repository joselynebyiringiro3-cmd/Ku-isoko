import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    return (
        <div className="product-card">
            <Link to={`/products/${product._id}`}>
                <div className="product-image">
                    <img
                        src={product.imageUrl?.startsWith('http') ? product.imageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.imageUrl}`}
                        alt={product.name}
                    />
                    {product.stock === 0 && <div className="out-of-stock">Out of Stock</div>}
                </div>

                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>

                    <div className="product-meta">
                        <span className="seller-name">
                            {product.sellerId?.name || 'Unknown Seller'}
                        </span>
                        {product.averageRating > 0 && (
                            <div className="rating">
                                <FaStar className="star" />
                                <span>{product.averageRating.toFixed(1)}</span>
                                <span className="review-count">({product.reviewCount})</span>
                            </div>
                        )}
                    </div>

                    <div className="product-footer">
                        <span className="price">{Math.round(product.price).toLocaleString()} Rwf</span>
                        {product.stock > 0 && product.stock < 10 && (
                            <span className="low-stock">Only {product.stock} left</span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
