const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    unique: true,
    trim: true,
    maxlength: [50, 'El nombre no puede ser mayor a 50 caracteres']
  },
  description: {
    type: String,
    maxlength: [200, 'La descripción no puede ser mayor a 200 caracteres']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  productCount: {
    type: Number,
    default: 0,
    min: [0, 'El conteo de productos no puede ser negativo']
  }
}, {
  timestamps: true
});

// Índices
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });
categorySchema.index({ parentCategory: 1 });

// Pre-save middleware para generar slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Método para actualizar conteo de productos
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 
    category: this._id, 
    isActive: true 
  });
  this.productCount = count;
  await this.save();
};

// Virtual para verificar si es categoría padre
categorySchema.virtual('isParent').get(function() {
  return this.subcategories && this.subcategories.length > 0;
});

// Asegurar que los virtuals se incluyan en JSON
categorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);