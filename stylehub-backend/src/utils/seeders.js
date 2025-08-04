const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/user');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Conectar a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub');
    console.log('📊 Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Datos de ejemplo para categorías
const categories = [
  {
    name: 'Hombre',
    description: 'Ropa y accesorios para hombre',
    slug: 'hombre',
    sortOrder: 1
  },
  {
    name: 'Mujer',
    description: 'Ropa y accesorios para mujer',
    slug: 'mujer',
    sortOrder: 2
  },
  {
    name: 'Accesorios',
    description: 'Accesorios y complementos',
    slug: 'accesorios',
    sortOrder: 3
  },
  {
    name: 'Deportes',
    description: 'Ropa deportiva y activewear',
    slug: 'deportes',
    sortOrder: 4
  }
];

// Función para crear usuarios de ejemplo
const createUsers = async () => {
  try {
    // Usuario administrador
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'StyleHub',
      email: 'admin@stylehub.com',
      password: 'Admin123!',
      role: 'admin',
      emailVerified: true
    });

    // Usuario cliente de ejemplo
    const customerUser = new User({
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      password: 'Customer123!',
      role: 'customer',
      emailVerified: true,
      phone: '+593999123456',
      addresses: [{
        street: 'Av. Principal 123',
        city: 'Manta',
        state: 'Manabí',
        zipCode: '130802',
        country: 'Ecuador',
        isDefault: true
      }]
    });

    await User.create([adminUser, customerUser]);
    console.log('✅ Usuarios creados');
  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  }
};

// Función para crear categorías
const createCategories = async () => {
  try {
    await Category.create(categories);
    console.log('✅ Categorías creadas');
  } catch (error) {
    console.error('❌ Error creando categorías:', error);
  }
};

// Función para crear productos de ejemplo
const createProducts = async () => {
  try {
    const createdCategories = await Category.find();
    const hombreCategory = createdCategories.find(cat => cat.slug === 'hombre');
    const mujerCategory = createdCategories.find(cat => cat.slug === 'mujer');
    const accesoriosCategory = createdCategories.find(cat => cat.slug === 'accesorios');

    const products = [
      {
        name: 'Camiseta Oversize Premium',
        description: 'Camiseta de algodón premium con corte oversize moderno. Perfecta para un look casual y cómodo.',
        price: 25,
        originalPrice: 35,
        category: hombreCategory._id,
        brand: 'StyleHub',
        images: [{
          url: 'https://images.unsplash.com/photo-1593032465171-8cbbcf2b1d90?w=400',
          alt: 'Camiseta Oversize Premium',
          isPrimary: true
        }],
        colors: ['Negro', 'Blanco', 'Gris', 'Azul Marino'],
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 50,
        sku: 'CAMI-OVER-001',
        isNew: true,
        isFeatured: true,
        tags: ['casual', 'oversize', 'algodón', 'básico'],
        rating: { average: 4.8, count: 127 }
      },
      {
        name: 'Vestido Floral Elegante',
        description: 'Vestido floral perfecto para ocasiones especiales. Diseño elegante y femenino.',
        price: 40,
        originalPrice: 55,
        category: mujerCategory._id,
        brand: 'StyleHub',
        images: [{
          url: 'https://images.unsplash.com/photo-1612423284934-b0bb19db68aa?w=400',
          alt: 'Vestido Floral Elegante',
          isPrimary: true
        }],
        colors: ['Floral Azul', 'Floral Rosa', 'Floral Verde'],
        sizes: ['XS', 'S', 'M', 'L'],
        stock: 30,
        sku: 'VEST-FLOR-001',
        isNew: false,
        isFeatured: true,
        tags: ['elegante', 'floral', 'vestido', 'ocasión especial'],
        rating: { average: 4.9, count: 89 }
      },
      {
        name: 'Gorra Clásica Vintage',
        description: 'Gorra de estilo clásico con acabado vintage. Perfecta para completar cualquier outfit.',
        price: 15,
        originalPrice: 20,
        category: accesoriosCategory._id,
        brand: 'StyleHub',
        images: [{
          url: 'https://images.unsplash.com/photo-1621784564114-d1d5f68065f2?w=400',
          alt: 'Gorra Clásica Vintage',
          isPrimary: true
        }],
        colors: ['Negro', 'Azul Marino', 'Beige', 'Gris'],
        sizes: ['Único'],
        stock: 75,
        sku: 'GORR-CLAS-001',
        isNew: false,
        isFeatured: false,
        tags: ['gorra', 'vintage', 'clásico', 'accesorio'],
        rating: { average: 4.6, count: 203 }
      },
      {
        name: 'Sudadera Hoodie Premium',
        description: 'Sudadera con capucha de máxima comodidad. Material suave y cálido para los días fríos.',
        price: 45,
        originalPrice: 60,
        category: hombreCategory._id,
        brand: 'StyleHub',
        images: [{
          url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
          alt: 'Sudadera Hoodie Premium',
          isPrimary: true
        }],
        colors: ['Gris', 'Negro', 'Azul', 'Rojo'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: 0, // Sin stock para probar funcionalidad
        sku: 'SUDA-HOOD-001',
        isNew: false,
        isFeatured: true,
        tags: ['sudadera', 'hoodie', 'cómodo', 'casual'],
        rating: { average: 4.7, count: 156 }
      },
      {
        name: 'Jeans Slim Fit',
        description: 'Jeans de corte slim con lavado moderno. Perfectos para un look casual elegante.',
        price: 55,
        originalPrice: 75,
        category: mujerCategory._id,
        brand: 'StyleHub',
        images: [{
          url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
          alt: 'Jeans Slim Fit',
          isPrimary: true
        }],
        colors: ['Azul Claro', 'Azul Oscuro', 'Negro'],
        sizes: ['26', '28', '30', '32', '34'],
        stock: 40,
        sku: 'JEAN-SLIM-001',
        isNew: true,
        isFeatured: false,
        tags: ['jeans', 'slim fit', 'denim', 'casual'],
        rating: { average: 4.5, count: 92 }
      },
      {
        name: 'Reloj Minimalista',
        description: 'Reloj de diseño minimalista y elegante. Perfecto para cualquier ocasión.',
        price: 85,
        originalPrice: 120,
        category: accesoriosCategory._id,
        brand: 'StyleHub',
        images: [{
          url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
          alt: 'Reloj Minimalista',
          isPrimary: true
        }],
        colors: ['Dorado', 'Plateado', 'Negro'],
        sizes: ['Único'],
        stock: 25,
        sku: 'RELO-MINI-001',
        isNew: false,
        isFeatured: true,
        tags: ['reloj', 'minimalista', 'elegante', 'accesorio'],
        rating: { average: 4.9, count: 67 }
      },
      {
        name: 'Camisa Formal Business',
        description: 'Camisa formal de alta calidad para el ámbito profesional. Corte clásico y elegante.',
        price: 35,
        originalPrice: 50,
        category: hombreCategory._id,
        brand: 'StyleHub',
        images: [{
          url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
          alt: 'Camisa Formal Business',
          isPrimary: true
        }],
        colors: ['Blanco', 'Azul Claro', 'Rosa Claro'],
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 60,
        sku: 'CAMI-FORM-001',
        isNew: false,
        isFeatured: false,
        tags: ['camisa', 'formal', 'business', 'elegante'],
        rating: { average: 4.4, count: 134 }
      },
      {
        name: 'Blusa Casual Verano',
        description: 'Blusa ligera y fresca para el verano. Diseño moderno y cómodo.',
        price: 28,
        originalPrice: 40,
        category: mujerCategory._id,
        brand: 'StyleHub',
        images: [{
          url: 'https://images.unsplash.com/photo-1564257577817-93bd3ac7c685?w=400',
          alt: 'Blusa Casual Verano',
          isPrimary: true
        }],
        colors: ['Blanco', 'Rosa', 'Amarillo', 'Verde Menta'],
        sizes: ['XS', 'S', 'M', 'L'],
        stock: 45,
        sku: 'BLUS-VERA-001',
        isNew: true,
        isFeatured: false,
        tags: ['blusa', 'verano', 'casual', 'ligera'],
        rating: { average: 4.6, count: 78 }
      }
    ];

    await Product.create(products);
    console.log('✅ Productos creados');

    // Actualizar contadores de productos en categorías
    for (const category of createdCategories) {
      await category.updateProductCount();
    }
    console.log('✅ Contadores de categorías actualizados');
    
  } catch (error) {
    console.error('❌ Error creando productos:', error);
  }
};

// Función principal para poblar la base de datos
const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando proceso de seeding...');
    
    await connectDB();

    // Limpiar base de datos existente
    console.log('🧹 Limpiando base de datos...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Crear datos de ejemplo
    await createUsers();
    await createCategories();
    await createProducts();

    console.log('✅ Seeding completado exitosamente');
    console.log('\n📋 Datos creados:');
    console.log(`👤 Usuarios: ${await User.countDocuments()}`);
    console.log(`📁 Categorías: ${await Category.countDocuments()}`);
    console.log(`📦 Productos: ${await Product.countDocuments()}`);
    console.log('\n🔑 Credenciales de acceso:');
    console.log('Admin: admin@stylehub.com / Admin123!');
    console.log('Cliente: juan@example.com / Customer123!');

  } catch (error) {
    console.error('❌ Error en seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
};

// Ejecutar seeding si el archivo se ejecuta directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  createUsers,
  createCategories,
  createProducts
};