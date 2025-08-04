import React, { createContext, useContext, useReducer } from 'react';
import { productService } from '../services/productservice';

const ProductContext = createContext();

const productReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
        loading: false
      };
    case 'SET_PRODUCT':
      return {
        ...state,
        currentProduct: action.payload,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

const initialState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null
};

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  const loadProducts = async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const products = await productService.getAll(params);
      dispatch({ type: 'SET_PRODUCTS', payload: products });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const loadProduct = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const product = await productService.getById(id);
      dispatch({ type: 'SET_PRODUCT', payload: product });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const value = {
    ...state,
    loadProducts,
    loadProduct
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};