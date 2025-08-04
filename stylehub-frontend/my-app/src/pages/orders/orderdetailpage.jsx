import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderService } from '../../services/orderservice';
import Loading from '../../components/common/Loading';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const orderData = await orderService.getById(id);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="order-detail-page">
      <div className="container">
        <h1>Order Details</h1>
        
        <div className="order-info">
          <div className="order-header">
            <h2>Order #{order._id.slice(-8)}</h2>
            <span className={`status ${order.status}`}>
              {order.status}
            </span>
          </div>
          
          <div className="order-meta">
            <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ${order.totalAmount?.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          </div>
          
          {order.shippingAddress && (
            <div className="shipping-address">
              <h3>Shipping Address</h3>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          )}
        </div>
        
        <div className="order-items">
          <h3>Items Ordered</h3>
          {order.items?.map(item => (
            <div key={item._id} className="order-item">
              <div className="item-info">
                <h4>{item.product?.name}</h4>
                <p>Price: ${item.price?.toFixed(2)}</p>
                <p>Quantity: {item.quantity}</p>
              </div>
              <div className="item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;