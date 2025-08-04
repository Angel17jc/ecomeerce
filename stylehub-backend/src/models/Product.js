const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede ser mayor a 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [1000, 'La descripción no puede ser mayor a 1000 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  originalPrice: {
    type: Number,
    min: [0, 'El precio original no puede ser negativo']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La categoría es requerida']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'La marca no puede ser mayor a 50 caracteres']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  colors: [{
    type: String,
    trim: true
  }],
  sizes: [{
    type: String,
    trim: true
  }],
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'La calificación no puede ser menor a 0'],
      max: [5, 'La calificación no puede ser mayor a 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'El conteo no puede ser negativo']
    }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  specifications: {
    material: String,
    care: String,
    origin: String,
    weight: Number
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'El meta título no puede ser mayor a 60 caracteres']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'La meta descripción no puede ser mayor a 160 caracteres']
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    }
  },
  sales: {
    type: Number,
    default: 0,
    min: [0, 'Las ventas no pueden ser negativas']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Las vistas no pueden ser negativas']
  }
}, {
  timestamps: true
});

// Índices para optimizar búsquedas
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ isActive: 1, isFeatured: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'seo.slug': 1 });

// Virtual para calcular descuento
productSchema.virtual('discount').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round((1 - this.price / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual para verificar si está en stock
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Pre-save middleware para generar slug automáticamente
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.seo.slug) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Pre-save middleware para validar precio original
productSchema.pre('save', function(next) {
  if (this.originalPrice && this.originalPrice < this.price) {
    next(new Error('El precio original no puede ser menor al precio actual'));
  }
  next();
});

// Método para actualizar rating
productSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { product: this._id } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
    this.rating.count = stats[0].totalReviews;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }

  await this.save();
};

// Método para incrementar vistas
productSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Asegurar que los virtuals se incluyan en JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);