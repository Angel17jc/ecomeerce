import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderservice';

const CheckoutPage = () => {
  const { items, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    paymentMethod: 'credit_card'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('shipping.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        shippingAddress: {
          ...formData.shippingAddress,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: items.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: getCartTotal(),
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod
      };

      const order = await orderService.create(orderData);
      await clearCart();
      navigate(`/orders/${order._id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error processing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <h1>Checkout</h1>
          <p>Your cart is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          <div className="order-summary">
            <h2>Order Summary</h2>
            {items.map(item => (
              <div key={item.productId} className="summary-item">
                <span>{item.product?.name}</span>
                <span>x{item.quantity}</span>
                <span>${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-total">
              <strong>Total: ${getCartTotal().toFixed(2)}</strong>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="checkout-form">
            <h2>Shipping Address</h2>
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="shipping.street"
                value={formData.shippingAddress.street}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="shipping.city"
                  value={formData.shippingAddress.city}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="shipping.state"
                  value={formData.shippingAddress.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  name="shipping.zipCode"
                  value={formData.shippingAddress.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="shipping.country"
                  value={formData.shippingAddress.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <h2>Payment Method</h2>
            <div className="form-group">
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;