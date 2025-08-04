const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productSnapshot: {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: String,
    sku: String
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'El precio no puede ser negativo']
  },
  selectedColor: String,
  selectedSize: String,
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'El subtotal no puede ser negativo']
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'Ecuador' }
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    sameAsShipping: { type: Boolean, default: true }
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cash_on_delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'El subtotal no puede ser negativo']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'El impuesto no puede ser negativo']
    },
    shipping: {
      type: Number,
      default: 0,
      min: [0, 'El envío no puede ser negativo']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'El descuento no puede ser negativo']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'El total no puede ser negativo']
    }
  },
  coupon: {
    code: String,
    discount: Number,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  },
  payment: {
    paymentId: String,
    transactionId: String,
    paymentDate: Date,
    paymentGateway: String,
    gatewayResponse: mongoose.Schema.Types.Mixed
  },
  shipping: {
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup'],
      default: 'standard'
    },
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date
  },
  timeline: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']
    },
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: {
    customer: {
      type: String,
      maxlength: [500, 'Las notas del cliente no pueden ser mayores a 500 caracteres']
    },
    internal: {
      type: String,
      maxlength: [1000, 'Las notas internas no pueden ser mayores a 1000 caracteres']
    }
  },
  cancellation: {
    reason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  }
}, {
  timestamps: true
});

// Índices
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'shipping.trackingNumber': 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware para generar número de orden
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const orderNumber = `SH${Date.now()}${String(count + 1).padStart(4, '0')}`;
    this.orderNumber = orderNumber;
  }
  next();
});

// Pre-save middleware para agregar timeline
orderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus') && !this.isNew) {
    this.timeline.push({
      status: this.orderStatus,
      date: new Date(),
      note: `Estado actualizado a: ${this.orderStatus}`
    });
  }
  next();
});

// Método para actualizar estado
orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.orderStatus = newStatus;
  this.timeline.push({
    status: newStatus,
    date: new Date(),
    note: note || `Estado actualizado a: ${newStatus}`,
    updatedBy
  });

  // Actualizar fechas específicas según el estado
  switch (newStatus) {
    case 'shipped':
      this.shipping.shippedAt = new Date();
      break;
    case 'delivered':
      this.shipping.deliveredAt = new Date();
      break;
    case 'cancelled':
      this.cancellation.cancelledAt = new Date();
      this.cancellation.cancelledBy = updatedBy;
      break;
  }

  return this.save();
};

// Método para procesar pago
orderSchema.methods.processPayment = function(paymentData) {
  this.payment = {
    ...this.payment,
    ...paymentData,
    paymentDate: new Date()
  };
  this.paymentStatus = 'paid';
  return this.updateStatus('confirmed', 'Pago procesado exitosamente');
};

// Método para calcular totales
orderSchema.methods.calculateTotals = function() {
  const subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  
  let discount = 0;
  if (this.coupon && this.coupon.discount) {
    if (this.coupon.discountType === 'percentage') {
      discount = (subtotal * this.coupon.discount) / 100;
    } else {
      discount = this.coupon.discount;
    }
  }

  this.pricing.subtotal = subtotal;
  this.pricing.discount = discount;
  this.pricing.total = subtotal + this.pricing.tax + this.pricing.shipping - discount;
  
  return this;
};

// Virtual para verificar si se puede cancelar
orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed', 'processing'].includes(this.orderStatus);
});

// Virtual para verificar si está entregado
orderSchema.virtual('isDelivered').get(function() {
  return this.orderStatus === 'delivered';
});

// Virtual para obtener el último estado del timeline
orderSchema.virtual('lastStatusUpdate').get(function() {
  return this.timeline.length > 0 ? this.timeline[this.timeline.length - 1] : null;
});

// Asegurar que los virtuals se incluyan en JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);