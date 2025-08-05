    const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ====== Registro de usuario ======
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar si ya existe
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'El usuario ya existe' });

    // Crear usuario
    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: 'Usuario registrado correctamente', user });
  } catch (err) {
    res.status(400).json({ message: 'Error al registrar usuario', error: err.message });
  }
});

// ====== Login de usuario ======
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    // Crear token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secreto', {
      expiresIn: '1d'
    });

    res.json({ message: 'Login exitoso', token, user });
  } catch (err) {
    res.status(500).json({ message: 'Error en el login', error: err.message });
  }
});

// ====== Obtener todos los usuarios ======
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Sin contraseñas
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
});

// ====== Obtener un usuario por ID ======
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el usuario', error: err.message });
  }
});

// ====== Actualizar usuario ======
router.put('/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar usuario', error: err.message });
  }
});

// ====== Eliminar usuario ======
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: err.message });
  }
});

module.exports = router;
