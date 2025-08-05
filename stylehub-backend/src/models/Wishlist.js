const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Relación con el usuario
    required: true
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Relación con productos
      required: true
    }
  ]
}, { timestamps: true });

// Evita OverwriteModelError
module.exports = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);
