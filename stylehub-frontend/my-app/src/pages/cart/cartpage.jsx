import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const CartPage = () => {
  const { items, loading, updateItem, removeItem, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Shopping Cart</h1>
          <p>Please <Link to="/login">login</Link> to view your cart.</p>
        </div>
      </div>
    );
  }

  if (loading) return <Loading />;

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Shopping Cart</h1>
          <p>Your cart is empty.</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>
        
        <div className="cart-items">
          {items.map(item => (
            <div key={item.productId} className="cart-item">
              <div className="item-image">
                <img 
                  src={item.product?.image || '/placeholder-image.jpg'} 
                  alt={item.product?.name} 
                />
              </div>
              
              <div className="item-info">
                <h3>{item.product?.name}</h3>
                <p className="item-price">${item.product?.price?.toFixed(2)}</p>
              </div>
              
              <div className="item-quantity">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.productId, parseInt(e.target.value))}
                />
              </div>
              
              <div className="item-total">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </div>
              
              <div className="item-actions">
                <button 
                  onClick={() => removeItem(item.productId)}
                  className="btn btn-danger"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h3>Total: ${getCartTotal().toFixed(2)}</h3>
          <Link to="/checkout" className="btn btn-primary">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;