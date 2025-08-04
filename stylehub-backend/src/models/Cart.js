const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'El precio no puede ser negativo']
  },
  selectedColor: {
    type: String,
    trim: true
  },
  selectedSize: {
    type: String,
    trim: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  coupon: {
    code: String,
    discount: {
      type: Number,
      min: 0,
      max: 100
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Las notas no pueden ser mayores a 500 caracteres']
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // 30 días en segundos
  }
}, {
  timestamps: true
});

// Índices
cartSchema.index({ user: 1 });
cartSchema.index({ updatedAt: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual para calcular subtotal
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

// Virtual para calcular cantidad total de items
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
});

// Virtual para calcular descuento del cupón
cartSchema.virtual('couponDiscount').get(function() {
  if (!this.coupon || !this.coupon.discount) return 0;
  
  const subtotal = this.subtotal;
  if (this.coupon.discountType === 'percentage') {
    return (subtotal * this.coupon.discount) / 100;
  } else {
    return Math.min(this.coupon.discount, subtotal);
  }
});

// Virtual para calcular total final
cartSchema.virtual('total').get(function() {
  return Math.max(0, this.subtotal - this.couponDiscount);
});

// Método para agregar item al carrito
cartSchema.methods.addItem = function(productId, quantity, price, color, size) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString() &&
    item.selectedColor === color &&
    item.selectedSize === size
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = price; // Actualizar precio por si cambió
  } else {
    this.items.push({
      product: productId,
      quantity,
      price,
      selectedColor: color,
      selectedSize: size
    });
  }

  // Actualizar fecha de expiración
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return this.save();
};

// Método para actualizar cantidad de un item
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Item no encontrado en el carrito');
  }

  if (quantity <= 0) {
    item.remove();
  } else {
    item.quantity = quantity;
  }

  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return this.save();
};

// Método para remover item del carrito
cartSchema.methods.removeItem = function(itemId) {
  this.items.id(itemId).remove();
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return this.save();
};

// Método para limpiar carrito
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.coupon = undefined;
  this.notes = '';
  return this.save();
};

// Método para aplicar cupón
cartSchema.methods.applyCoupon = function(code, discount, discountType = 'percentage') {
  this.coupon = {
    code,
    discount,
    discountType
  };
  return this.save();
};

// Middleware para limpiar items con productos inactivos
cartSchema.pre('find', function() {
  this.populate({
    path: 'items.product',
    match: { isActive: true },
    select: 'name price images stock isActive'
  });
});

cartSchema.pre('findOne', function() {
  this.populate({
    path: 'items.product',
    match: { isActive: true },
    select: 'name price images stock isActive'
  });
});

// Asegurar que los virtuals se incluyan en JSON
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);    