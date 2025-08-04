import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>E-Commerce</h1>
        </Link>
        
        <nav className="nav">
          <Link to="/products">Products</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="cart-link">
                Cart ({getCartCount()})
              </Link>
              <Link to="/orders">Orders</Link>
              <Link to="/profile">Profile</Link>
              {user?.role === 'admin' && (
                <Link to="/admin">Admin</Link>
              )}
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;