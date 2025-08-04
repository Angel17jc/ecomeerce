const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array().map(error => ({
        field: error.path,
        value: error.value,
        message: error.msg
      }))
    });
  }
  next();
};

// Validaciones para autenticación
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras'),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .isLength({ max: 100 })
    .withMessage('El email no puede tener más de 100 caracteres'),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('La contraseña debe tener entre 6 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),

  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Número de teléfono inválido'),

  handleValidationErrors
];

const loginValidation = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Debe ser un email válido'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),

  handleValidationErrors
];

// Validaciones para productos
const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del producto es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo')
    .toFloat(),

  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio original debe ser un número positivo')
    .toFloat(),

  body('category')
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isMongoId()
    .withMessage('ID de categoría inválido'),

  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero positivo')
    .toInt(),

  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La marca no puede tener más de 50 caracteres'),

  body('colors')
    .optional()
    .isArray()
    .withMessage('Los colores deben ser un array'),

  body('colors.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Cada color debe tener entre 2 y 30 caracteres'),

  body('sizes')
    .optional()
    .isArray()
    .withMessage('Las tallas deben ser un array'),

  body('sizes.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Cada talla debe tener entre 1 y 10 caracteres'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array'),

  body('isNew')
    .optional()
    .isBoolean()
    .withMessage('isNew debe ser un valor booleano'),

  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured debe ser un valor booleano'),

  handleValidationErrors
];

// Validaciones para carrito
const addToCartValidation = [
  body('productId')
    .notEmpty()
    .withMessage('El ID del producto es requerido')
    .isMongoId()
    .withMessage('ID de producto inválido'),

  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La cantidad debe ser un número entre 1 y 100')
    .toInt(),

  body('selectedColor')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('El color no puede tener más de 30 caracteres'),

  body('selectedSize')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('La talla no puede tener más de 10 caracteres'),

  handleValidationErrors
];

const updateCartValidation = [
  param('itemId')
    .isMongoId()
    .withMessage('ID de item inválido'),

  body('quantity')
    .isInt({ min: 0, max: 100 })
    .withMessage('La cantidad debe ser un número entre 0 y 100')
    .toInt(),

  handleValidationErrors
];

// Validaciones para órdenes
const createOrderValidation = [
  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

  body('shippingAddress.lastName')
    .trim()
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),

  body('shippingAddress.email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Email inválido'),

  body('shippingAddress.phone')
    .trim()
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Número de teléfono inválido'),

  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isLength({ min: 5, max: 200 })
    .withMessage('La dirección debe tener entre 5 y 200 caracteres'),

  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('La ciudad es requerida')
    .isLength({ min: 2, max: 50 })
    .withMessage('La ciudad debe tener entre 2 y 50 caracteres'),

  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('El estado/provincia es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El estado debe tener entre 2 y 50 caracteres'),

  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('El código postal es requerido')
    .matches(/^[\d-]+$/)
    .withMessage('Código postal inválido'),

  body('shippingAddress.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El país debe tener entre 2 y 50 caracteres'),

  body('paymentMethod')
    .notEmpty()
    .withMessage('El método de pago es requerido')
    .isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cash_on_delivery'])
    .withMessage('Método de pago inválido'),

  body('notes.customer')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden tener más de 500 caracteres'),

  handleValidationErrors
];

// Validaciones para categorías
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la categoría es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La descripción no puede tener más de 200 caracteres'),

  body('parentCategory')
    .optional()
    .isMongoId()
    .withMessage('ID de categoría padre inválido'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número entero positivo')
    .toInt(),

  handleValidationErrors
];

// Validaciones para query parameters
const productQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100')
    .toInt(),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio mínimo debe ser un número positivo')
    .toFloat(),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio máximo debe ser un número positivo')
    .toFloat(),

  query('category')
    .optional()
    .isMongoId()
    .withMessage('ID de categoría inválido'),

  query('sortBy')
    .optional()
    .isIn(['name', 'price-low', 'price-high', 'rating', 'newest', 'oldest', 'popular'])
    .withMessage('Criterio de ordenamiento inválido'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres'),

  handleValidationErrors
];

// Validaciones para parámetros de ID
const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID inválido'),

  handleValidationErrors
];

// Validaciones para actualización de perfil
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras'),

  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Número de teléfono inválido'),

  body('addresses')
    .optional()
    .isArray()
    .withMessage('Las direcciones deben ser un array'),

  body('addresses.*.street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('La dirección debe tener entre 5 y 200 caracteres'),

  body('addresses.*.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La ciudad debe tener entre 2 y 50 caracteres'),

  body('addresses.*.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El estado debe tener entre 2 y 50 caracteres'),

  body('addresses.*.zipCode')
    .optional()
    .trim()
    .matches(/^[\d-]+$/)
    .withMessage('Código postal inválido'),

  body('addresses.*.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El país debe tener entre 2 y 50 caracteres'),

  handleValidationErrors
];

// Validaciones para cambio de contraseña
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),

  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('La nueva contraseña debe tener entre 6 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('La confirmación de contraseña no coincide');
      }
      return true;
    }),

  handleValidationErrors
];

// Validaciones para recuperación de contraseña
const forgotPasswordValidation = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Debe ser un email válido'),

  handleValidationErrors
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('El token es requerido'),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('La contraseña debe tener entre 6 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('La confirmación de contraseña no coincide');
      }
      return true;
    }),

  handleValidationErrors
];

// Validaciones para reviews
const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe ser un número entre 1 y 5')
    .toInt(),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('El comentario no puede tener más de 500 caracteres'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('El título debe tener entre 5 y 100 caracteres'),

  handleValidationErrors
];

// Validaciones para cupones
const couponValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('El código del cupón es requerido')
    .isLength({ min: 3, max: 20 })
    .withMessage('El código debe tener entre 3 y 20 caracteres')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('El código solo puede contener letras mayúsculas y números'),

  body('discount')
    .isFloat({ min: 0, max: 100 })
    .withMessage('El descuento debe ser un número entre 0 y 100')
    .toFloat(),

  body('discountType')
    .isIn(['percentage', 'fixed'])
    .withMessage('El tipo de descuento debe ser "percentage" o "fixed"'),

  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El monto mínimo de orden debe ser un número positivo')
    .toFloat(),

  body('maxUses')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El máximo de usos debe ser un número entero positivo')
    .toInt(),

  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('La fecha de expiración debe ser una fecha válida')
    .toDate(),

  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  productValidation,
  addToCartValidation,
  updateCartValidation,
  createOrderValidation,
  categoryValidation,
  productQueryValidation,
  mongoIdValidation,
  updateProfileValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  reviewValidation,
  couponValidation
};