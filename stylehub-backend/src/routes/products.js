const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  getNewProducts,
  getProductStats
} = require('../controllers/productController');

const { authenticate, authorize } = require('../middleware/auth');
const {
  productValidation,
  productQueryValidation,
  mongoIdValidation
} = require('../middleware/validation');

// Rutas públicas
router.get('/', productQueryValidation, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/new', getNewProducts);
router.get('/search', searchProducts);
router.get('/category/:categoryId', mongoIdValidation, getProductsByCategory);
router.get('/:id', mongoIdValidation, getProductById);

// Rutas privadas - Solo administradores
router.use(authenticate);
router.use(authorize('admin'));

router.post('/', productValidation, createProduct);
router.put('/:id', mongoIdValidation, productValidation, updateProduct);
router.delete('/:id', mongoIdValidation, deleteProduct);
router.get('/admin/stats', getProductStats);

module.exports = router;