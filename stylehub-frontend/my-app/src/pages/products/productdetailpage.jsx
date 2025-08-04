import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { currentProduct, loading, loadProduct } = useProducts();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct(id);
  }, [id]);

  const handleAddToCart = () => {
    if (isAuthenticated && currentProduct) {
      addItem(currentProduct._id, quantity);
    }
  };

  if (loading) return <Loading />;
  if (!currentProduct) return <div>Product not found</div>;

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail">
          <div className="product-image">
            <img 
              src={currentProduct.image || '/placeholder-image.jpg'} 
              alt={currentProduct.name} 
            />
          </div>
          
          <div className="product-info">
            <h1>{currentProduct.name}</h1>
            <p className="price">${currentProduct.price?.toFixed(2)}</p>
            <p className="description">{currentProduct.description}</p>
            
            {currentProduct.category && (
              <p className="category">Category: {currentProduct.category.name}</p>
            )}
            
            <p className="stock">
              {currentProduct.stock > 0 
                ? `In Stock (${currentProduct.stock} available)` 
                : 'Out of Stock'
              }
            </p>

            {isAuthenticated && currentProduct.stock > 0 && (
              <div className="purchase-section">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={currentProduct.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  />
                </div>
                <button onClick={handleAddToCart} className="btn btn-primary">
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;