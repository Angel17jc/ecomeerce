// src/services/api.js
import axios from 'axios';
import { useState } from 'react';

// Configuración base de la API
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para agregar token automáticamente
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores específicos
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Extraer mensaje de error del backend
    const message = error.response?.data?.message || 'Error de conexión';
    error.message = message;
    
    return Promise.reject(error);
  }
);

// Servicios de Autenticación
export const authAPI = {
  // Registro de usuario
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    if (response.data.success) {
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // Inicio de sesión
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    if (response.data.success) {
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Obtener perfil
  getProfile: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    const response = await API.put('/auth/profile', profileData);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    const response = await API.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Recuperar contraseña
  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Resetear contraseña
  resetPassword: async (resetData) => {
    const response = await API.post('/auth/reset-password', resetData);
    return response.data;
  }
};

// Servicios de Productos
export const productsAPI = {
  // Obtener todos los productos con filtros
  getProducts: async (params = {}) => {
    const response = await API.get('/products', { params });
    return response.data;
  },

  // Obtener producto por ID
  getProductById: async (id) => {
    const response = await API.get(`/products/${id}`);
    return response.data;
  },

  // Buscar productos
  searchProducts: async (query, params = {}) => {
    const response = await API.get('/products/search', { 
      params: { q: query, ...params } 
    });
    return response.data;
  },

  // Obtener productos destacados
  getFeaturedProducts: async (limit = 8) => {
    const response = await API.get('/products/featured', { 
      params: { limit } 
    });
    return response.data;
  },

  // Obtener productos nuevos
  getNewProducts: async (limit = 8) => {
    const response = await API.get('/products/new', { 
      params: { limit } 
    });
    return response.data;
  },

  // Obtener productos por categoría
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await API.get(`/products/category/${categoryId}`, { params });
    return response.data;
  },

  // Crear producto (admin)
  createProduct: async (productData) => {
    const response = await API.post('/products', productData);
    return response.data;
  },

  // Actualizar producto (admin)
  updateProduct: async (id, productData) => {
    const response = await API.put(`/products/${id}`, productData);
    return response.data;
  },

  // Eliminar producto (admin)
  deleteProduct: async (id) => {
    const response = await API.delete(`/products/${id}`);
    return response.data;
  }
};

// Servicios de Categorías
export const categoriesAPI = {
  // Obtener todas las categorías
  getCategories: async () => {
    const response = await API.get('/categories');
    return response.data;
  },

  // Crear categoría (admin)
  createCategory: async (categoryData) => {
    const response = await API.post('/categories', categoryData);
    return response.data;
  },

  // Actualizar categoría (admin)
  updateCategory: async (id, categoryData) => {
    const response = await API.put(`/categories/${id}`, categoryData);
    return response.data;
  }
};

// Servicios de Carrito
export const cartAPI = {
  // Obtener carrito
  getCart: async () => {
    const response = await API.get('/cart');
    return response.data;
  },

  // Agregar producto al carrito
  addToCart: async (productData) => {
    const response = await API.post('/cart/add', productData);
    return response.data;
  },

  // Actualizar cantidad en carrito
  updateCartItem: async (itemId, quantity) => {
    const response = await API.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  // Eliminar item del carrito
  removeCartItem: async (itemId) => {
    const response = await API.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  // Limpiar carrito
  clearCart: async () => {
    const response = await API.delete('/cart');
    return response.data;
  },

  // Aplicar cupón
  applyCoupon: async (code) => {
    const response = await API.post('/cart/coupon', { code });
    return response.data;
  },

  // Remover cupón
  removeCoupon: async () => {
    const response = await API.delete('/cart/coupon');
    return response.data;
  },

  // Validar carrito
  validateCart: async () => {
    const response = await API.post('/cart/validate');
    return response.data;
  }
};

// Servicios de Órdenes
export const ordersAPI = {
  // Crear nueva orden
  createOrder: async (orderData) => {
    const response = await API.post('/orders', orderData);
    return response.data;
  },

  // Obtener órdenes del usuario
  getOrders: async (params = {}) => {
    const response = await API.get('/orders', { params });
    return response.data;
  },

  // Obtener orden por ID
  getOrderById: async (id) => {
    const response = await API.get(`/orders/${id}`);
    return response.data;
  },

  // Cancelar orden
  cancelOrder: async (id, reason) => {
    const response = await API.put(`/orders/${id}/cancel`, { reason });
    return response.data;
  }
};

// Utilidades
export const apiUtils = {
  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Obtener usuario del localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar si el usuario es admin
  isAdmin: () => {
    const user = apiUtils.getCurrentUser();
    return user?.role === 'admin';
  },

  // Limpiar datos de autenticación
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Formatear errores para mostrar al usuario
  formatError: (error) => {
    if (error.response?.data?.errors) {
      // Errores de validación
      return error.response.data.errors.map(err => err.message).join(', ');
    }
    return error.message || 'Ha ocurrido un error inesperado';
  }
};

// Hook personalizado para manejar estados de loading
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = apiUtils.formatError(err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
};

// Exportar instancia principal
export default API;