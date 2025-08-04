const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Obtener todos los productos con filtros
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Construir filtros
    const filters = { isActive: true };
    
    // Filtro por categoría
    if (req.query.category) {
      filters.category = req.query.category;
    }
    
    // Filtro por búsqueda de texto
    if (req.query.search) {
      filters.$text = { $search: req.query.search };
    }
    
    // Filtro por rango de precios
    if (req.query.minPrice || req.query.maxPrice) {
      filters.price = {};
      if (req.query.minPrice) filters.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filters.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    // Filtro por disponibilidad
    if (req.query.inStock === 'true') {
      filters.stock = { $gt: 0 };
    }
    
    // Filtro por productos nuevos
    if (req.query.isNew === 'true') {
      filters.isNew = true;
    }
    
    // Filtro por productos destacados
    if (req.query.isFeatured === 'true') {
      filters.isFeatured = true;
    }
    
    // Filtro por marca
    if (req.query.brand) {
      filters.brand = new RegExp(req.query.brand, 'i');
    }
    
    // Filtro por rating mínimo
    if (req.query.minRating) {
      filters['rating.average'] = { $gte: parseFloat(req.query.minRating) };
    }
    
    // Configurar ordenamiento
    let sort = {};
    switch (req.query.sortBy) {
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'popular':
        sort = { sales: -1, views: -1 };
        break;
      case 'name':
      default:
        sort = { name: 1 };
    }
    
    // Ejecutar consulta
    const products = await Product.find(filters)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(); // Para mejor rendimiento
    
    // Contar total de documentos
    const total = await Product.countDocuments(filters);
    
    // Calcular información de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    res.json({
      success: true,
      data: products,
      pagination: {
        current: page,
        pages: totalPages,
        total,
        limit,
        hasNext,
        hasPrev,
        next: hasNext ? page + 1 : null,
        prev: hasPrev ? page - 1 : null
      },
      filters: {
        applied: Object.keys(req.query).filter(key => !['page', 'limit'].includes(key)),
        total: total
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// @desc    Obtener producto por ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('reviews', 'rating comment title user createdAt');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Producto no disponible'
      });
    }

    // Incrementar vistas (opcional, en background)
    product.incrementViews().catch(err => 
      console.error('Error incrementando vistas:', err)
    );

    // Obtener productos relacionados (misma categoría)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    })
    .select('name price images rating')
    .limit(4)
    .lean();

    res.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });

  } catch (error) {
    console.error('Error obteniendo producto:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Crear nuevo producto
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    // Verificar que la categoría existe
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Validar precio original vs precio actual
    if (req.body.originalPrice && req.body.originalPrice < req.body.price) {
      return res.status(400).json({
        success: false,
        message: 'El precio original no puede ser menor al precio actual'
      });
    }

    const product = new Product(req.body);
    await product.save();

    // Actualizar contador de productos en la categoría
    category.updateProductCount().catch(err => 
      console.error('Error actualizando contador de categoría:', err)
    );

    // Populate para la respuesta
    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: product
    });

  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// @desc    Actualizar producto
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Si se está cambiando la categoría, verificar que existe
    if (req.body.category && req.body.category !== product.category.toString()) {
      const newCategory = await Category.findById(req.body.category);
      if (!newCategory) {
        return res.status(400).json({
          success: false,
          message: 'Nueva categoría no encontrada'
        });
      }
    }

    // Validar precio original vs precio actual
    const newPrice = req.body.price || product.price;
    const newOriginalPrice = req.body.originalPrice !== undefined ? req.body.originalPrice : product.originalPrice;
    
    if (newOriginalPrice && newOriginalPrice < newPrice) {
      return res.status(400).json({
        success: false,
        message: 'El precio original no puede ser menor al precio actual'
      });
    }

    // Actualizar producto
    Object.assign(product, req.body);
    await product.save();

    // Populate para la respuesta
    await product.populate('category', 'name slug');

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: product
    });

  } catch (error) {
    console.error('Error actualizando producto:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Eliminar producto (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Soft delete - marcar como inactivo
    product.isActive = false;
    await product.save();

    // Actualizar contador de productos en la categoría
    const category = await Category.findById(product.category);
    if (category) {
      category.updateProductCount().catch(err => 
        console.error('Error actualizando contador de categoría:', err)
      );
    }

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando producto:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener productos por categoría
// @route   GET /api/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Verificar que la categoría existe
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const filters = { 
      category: categoryId, 
      isActive: true 
    };

    // Aplicar filtros adicionales
    if (req.query.minPrice || req.query.maxPrice) {
      filters.price = {};
      if (req.query.minPrice) filters.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filters.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Ordenamiento
    let sort = { name: 1 };
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'price-low':
          sort = { price: 1 };
          break;
        case 'price-high':
          sort = { price: -1 };
          break;
        case 'rating':
          sort = { 'rating.average': -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
      }
    }

    const products = await Product.find(filters)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filters);

    res.json({
      success: true,
      data: {
        category: {
          id: category._id,
          name: category.name,
          slug: category.slug
        },
        products
      },
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Buscar productos
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La consulta de búsqueda debe tener al menos 2 caracteres'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Búsqueda por texto
    const searchFilters = {
      isActive: true,
      $or: [
        { $text: { $search: query } },
        { name: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { brand: new RegExp(query, 'i') },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    const products = await Product.find(searchFilters)
      .populate('category', 'name slug')
      .sort({ score: { $meta: 'textScore' }, 'rating.average': -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(searchFilters);

    // Obtener sugerencias si no hay resultados
    let suggestions = [];
    if (total === 0) {
      suggestions = await Product.find({
        isActive: true,
        $or: [
          { name: new RegExp(query.substring(0, 3), 'i') },
          { tags: { $in: [new RegExp(query.substring(0, 3), 'i')] } }
        ]
      })
      .select('name')
      .limit(5)
      .lean();
    }

    res.json({
      success: true,
      data: products,
      searchInfo: {
        query,
        total,
        suggestions: suggestions.map(s => s.name)
      },
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener productos destacados
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({
      isActive: true,
      isFeatured: true
    })
    .populate('category', 'name slug')
    .sort({ 'rating.average': -1, sales: -1 })
    .limit(limit)
    .lean();

    res.json({
      success: true,
      data: products,
      total: products.length
    });

  } catch (error) {
    console.error('Error obteniendo productos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener productos nuevos
// @route   GET /api/products/new
// @access  Public
exports.getNewProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({
      isActive: true,
      isNew: true
    })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

    res.json({
      success: true,
      data: products,
      total: products.length
    });

  } catch (error) {
    console.error('Error obteniendo productos nuevos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener estadísticas de productos (Admin)
// @route   GET /api/products/stats
// @access  Private/Admin
exports.getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' },
          averageRating: { $avg: '$rating.average' },
          totalViews: { $sum: '$views' },
          totalSales: { $sum: '$sales' }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $project: {
          categoryName: '$categoryInfo.name',
          count: 1,
          averagePrice: { $round: ['$averagePrice', 2] },
          totalStock: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        general: stats[0] || {
          totalProducts: 0,
          averagePrice: 0,
          totalStock: 0,
          averageRating: 0,
          totalViews: 0,
          totalSales: 0
        },
        byCategory: categoryStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};