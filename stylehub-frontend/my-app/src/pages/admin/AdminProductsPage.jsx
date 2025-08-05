import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import AdminProductsPage from './AdminProductsPage';
import AdminOrdersPage from './AdminOrdersPage';
import AdminUsersPage from './AdminUsersPage';

const DashboardPage = () => {
  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <h2>Admin Panel</h2>
            <nav className="admin-nav">
              <Link to="/admin">Dashboard</Link>
              <Link to="/admin/products">Products</Link>
              <Link to="/admin/orders">Orders</Link>
              <Link to="/admin/users">Users</Link>
            </nav>
          </aside>
          
          <main className="admin-content">
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="dashboard-overview">
      <h1>Dashboard Overview</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-number">-</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">-</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">-</p>
        </div>
        <div className="stat-card">
          <h3>Revenue</h3>
          <p className="stat-number">$-</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;