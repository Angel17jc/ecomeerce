import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = () => {
    if (isAuthenticated) {
      addItem(product._id, 1);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <img src={product.image || '/placeholder-image.jpg'} alt={product.name} />
      </Link>
      <div className="product-info">
        <h3>
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h3>
        <p className="product-price">${product.price?.toFixed(2)}</p>
        <p className="product-description">{product.description}</p>
        {isAuthenticated && (
          <button onClick={handleAddToCart} className="btn btn-primary">
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;