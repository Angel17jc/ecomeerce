import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderservice';
import Loading from '../../components/common/Loading';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await orderService.getAll();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="orders-page">
      <div className="container">
        <h1>My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet.</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order._id.slice(-8)}</h3>
                  <span className={`status ${order.status}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="order-info">
                  <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p>Total: ${order.totalAmount?.toFixed(2)}</p>
                  <p>Items: {order.items?.length}</p>
                </div>
                
                <div className="order-actions">
                  <Link to={`/orders/${order._id}`} className="btn btn-outline">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;