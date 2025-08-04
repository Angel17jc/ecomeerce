import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/products/ProductCard';
import Loading from '../components/common/Loading';

const HomePage = () => {
  const { products, loading, loadProducts } = useProducts();

  useEffect(() => {
    loadProducts({ limit: 8 });
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <h1>Welcome to Our Store</h1>
          <p>Discover amazing products at great prices</p>
          <Link to="/products" className="btn btn-primary">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="products-grid">
            {products.slice(0, 8).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="text-center">
            <Link to="/products" className="btn btn-outline">
              View All Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;