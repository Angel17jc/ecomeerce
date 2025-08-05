const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');

// Obtener la wishlist de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.params.userId })
      .populate('products', 'name price'); // Mostrar nombre y precio de productos
    if (!wishlist) return res.json({ products: [] });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la wishlist', error: err.message });
  }
});

// Agregar un producto a la wishlist
router.post('/:userId', async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.params.userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.params.userId, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      }
    }

    await wishlist.save();
    res.status(201).json(wishlist);
  } catch (err) {
    res.status(400).json({ message: 'Error al agregar a la wishlist', error: err.message });
  }
});

// Eliminar un producto de la wishlist
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.params.userId });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist no encontrada' });

    wishlist.products = wishlist.products.filter(
      prod => prod.toString() !== req.params.productId
    );

    await wishlist.save();
    res.json({ message: 'Producto eliminado de la wishlist' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar de la wishlist', error: err.message });
  }
});

module.exports = router;
