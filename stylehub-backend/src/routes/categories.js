const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); // Importa el modelo

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener las categorías', error: err.message });
  }
});

// Obtener una categoría por ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la categoría', error: err.message });
  }
});

// Crear nueva categoría
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: 'Error al crear la categoría', error: err.message });
  }
});

// Actualizar categoría
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!updatedCategory) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar la categoría', error: err.message });
  }
});

// Eliminar categoría
router.delete('/:id', async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar la categoría', error: err.message });
  }
});

module.exports = router;
