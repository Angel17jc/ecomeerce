const express = require('express');
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  validateCart
} = require('../controllers/cartController');

const { authenticate } = require('../middleware/auth');
const {
  addToCartValidation,
  updateCartValidation,
  mongoIdValidation
} = require('../middleware/validation');

// Todas las rutas del carrito requieren autenticación
router.use(authenticate);

// Rutas del carrito
router.get('/', getCart);
router.post('/add', addToCartValidation, addToCart);
router.put('/items/:itemId', updateCartValidation, updateCartItem);
router.delete('/items/:itemId', mongoIdValidation, removeCartItem);
router.delete('/', clearCart);

// Rutas de cupones
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);

// Validación del carrito
router.post('/validate', validateCart);

module.exports = router;