const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Obtener todas las órdenes
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener órdenes', error: err.message });
  }
});

// Obtener una orden por ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price');
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la orden', error: err.message });
  }
});

// Crear una nueva orden
router.post('/', async (req, res) => {
  try {
    const { user, items, totalAmount, status } = req.body;
    const newOrder = new Order({ user, items, totalAmount, status });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear la orden', error: err.message });
  }
});

// Actualizar una orden
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    .populate('user', 'name email')
    .populate('items.product', 'name price');

    if (!updatedOrder) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar la orden', error: err.message });
  }
});

// Eliminar una orden
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json({ message: 'Orden eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la orden', error: err.message });
  }
});

module.exports = router;
