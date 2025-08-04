export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout'
  },
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  CART: '/cart',
  ORDERS: '/orders',
  USERS: '/users'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};