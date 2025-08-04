const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Obtener carrito del usuario
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price images stock isActive colors sizes',
        match: { isActive: true }
      });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }

    // Filtrar items con productos inactivos o eliminados
    const validItems = cart.items.filter(item => item.product && item.product.isActive);
    
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json({
      success: true,
      data: cart
    });

  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Agregar producto al carrito
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, selectedColor, selectedSize } = req.body;

    // Verificar que el producto existe y está activo
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado o no disponible'
      });
    }

    // Verificar stock disponible
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Solo quedan ${product.stock} unidades disponibles`
      });
    }

    // Verificar color y talla si son requeridos
    if (product.colors.length > 0 && !selectedColor) {
      return res.status(400).json({
        success: false,
        message: 'Debe seleccionar un color'
      });
    }

    if (product.sizes.length > 0 && !selectedSize) {
      return res.status(400).json({
        success: false,
        message: 'Debe seleccionar una talla'
      });
    }

    // Verificar que el color y talla seleccionados están disponibles
    if (selectedColor && !product.colors.includes(selectedColor)) {
      return res.status(400).json({
        success: false,
        message: 'Color no disponible para este producto'
      });
    }

    if (selectedSize && !product.sizes.includes(selectedSize)) {
      return res.status(400).json({
        success: false,
        message: 'Talla no disponible para este producto'
      });
    }

    // Obtener o crear carrito
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Verificar si el producto ya está en el carrito con las mismas especificaciones
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId &&
      item.selectedColor === selectedColor &&
      item.selectedSize === selectedSize
    );

    if (existingItemIndex !== -1) {
      // Si ya existe, aumentar la cantidad
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Verificar stock total
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `No se puede agregar más cantidad. Stock disponible: ${product.stock}`
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.price; // Actualizar precio por si cambió
    } else {
      // Si no existe, agregar nuevo item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        selectedColor,
        selectedSize
      });
    }

    await cart.save();

    // Populate para la respuesta
    await cart.populate({
      path: 'items.product',
      select: 'name price images stock isActive colors sizes'
    });

    res.json({
      success: true,
      message: 'Producto agregado al carrito exitosamente',
      data: cart
    });

  } catch (error) {
    console.error('Error agregando al carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Actualizar cantidad de item en el carrito
// @route   PUT /api/cart/items/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado en el carrito'
      });
    }

    // Si quantity es 0, eliminar el item
    if (quantity === 0) {
      item.remove();
    } else {
      // Verificar stock disponible
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Producto no disponible'
        });
      }

      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Solo quedan ${product.stock} unidades disponibles`
        });
      }

      item.quantity = quantity;
      item.price = product.price; // Actualizar precio por si cambió
    }

    await cart.save();

    // Populate para la respuesta
    await cart.populate({
      path: 'items.product',
      select: 'name price images stock isActive colors sizes'
    });

    res.json({
      success: true,
      message: quantity === 0 ? 'Item eliminado del carrito' : 'Cantidad actualizada exitosamente',
      data: cart
    });

  } catch (error) {
    console.error('Error actualizando item del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Eliminar item del carrito
// @route   DELETE /api/cart/items/:itemId
// @access  Private
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado en el carrito'
      });
    }

    item.remove();
    await cart.save();

    // Populate para la respuesta
    await cart.populate({
      path: 'items.product',
      select: 'name price images stock isActive colors sizes'
    });

    res.json({
      success: true,
      message: 'Item eliminado del carrito exitosamente',
      data: cart
    });

  } catch (error) {
    console.error('Error eliminando item del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Limpiar carrito completo
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    cart.items = [];
    cart.coupon = undefined;
    cart.notes = '';
    await cart.save();

    res.json({
      success: true,
      message: 'Carrito limpiado exitosamente',
      data: cart
    });

  } catch (error) {
    console.error('Error limpiando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Aplicar cupón de descuento
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Código de cupón requerido'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No puedes aplicar un cupón a un carrito vacío'
      });
    }

    // Aquí implementarías la lógica de validación de cupones
    // Por ahora, simulamos algunos cupones de ejemplo
    const validCoupons = {
      'WELCOME10': { discount: 10, discountType: 'percentage', minAmount: 0 },
      'SAVE20': { discount: 20, discountType: 'percentage', minAmount: 50 },
      'FIRST5': { discount: 5, discountType: 'fixed', minAmount: 25 }
    };

    const coupon = validCoupons[code.toUpperCase()];
    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Cupón inválido o expirado'
      });
    }

    // Verificar monto mínimo
    if (cart.subtotal < coupon.minAmount) {
      return res.status(400).json({
        success: false,
        message: `El monto mínimo para este cupón es $${coupon.minAmount}`
      });
    }

    // Aplicar cupón
    cart.coupon = {
      code: code.toUpperCase(),
      discount: coupon.discount,
      discountType: coupon.discountType
    };

    await cart.save();

    // Populate para la respuesta
    await cart.populate({
      path: 'items.product',
      select: 'name price images stock isActive colors sizes'
    });

    res.json({
      success: true,
      message: 'Cupón aplicado exitosamente',
      data: cart
    });

  } catch (error) {
    console.error('Error aplicando cupón:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Remover cupón
// @route   DELETE /api/cart/coupon
// @access  Private
exports.removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    cart.coupon = undefined;
    await cart.save();

    // Populate para la respuesta
    await cart.populate({
      path: 'items.product',
      select: 'name price images stock isActive colors sizes'
    });

    res.json({
      success: true,
      message: 'Cupón removido exitosamente',
      data: cart
    });

  } catch (error) {
    console.error('Error removiendo cupón:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Verificar disponibilidad de items en el carrito
// @route   POST /api/cart/validate
// @access  Private
exports.validateCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name price images stock isActive colors sizes'
      });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    const validationErrors = [];
    const validItems = [];

    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        validationErrors.push({
          itemId: item._id,
          error: 'Producto no disponible',
          action: 'remove'
        });
        continue;
      }

      // Verificar stock
      if (item.quantity > item.product.stock) {
        validationErrors.push({
          itemId: item._id,
          productName: item.product.name,
          error: `Stock insuficiente. Disponible: ${item.product.stock}`,
          action: 'update_quantity',
          maxQuantity: item.product.stock
        });

        // Actualizar cantidad al stock disponible
        if (item.product.stock > 0) {
          item.quantity = item.product.stock;
          validItems.push(item);
        }
      } else {
        // Verificar si el precio cambió
        if (item.price !== item.product.price) {
          item.price = item.product.price;
          validationErrors.push({
            itemId: item._id,
            productName: item.product.name,
            error: 'El precio del producto ha cambiado',
            action: 'price_update',
            oldPrice: item.price,
            newPrice: item.product.price
          });
        }

        validItems.push(item);
      }
    }

    // Actualizar carrito si hay cambios
    if (validationErrors.length > 0) {
      cart.items = validItems;
      await cart.save();
    }

    const isValid = validationErrors.length === 0;

    res.json({
      success: true,
      data: {
        isValid,
        cart,
        validationErrors
      },
      message: isValid ? 'Carrito válido' : 'Se encontraron problemas en el carrito'
    });

  } catch (error) {
    console.error('Error validando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};