const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('❌ Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado';
    error = {
      statusCode: 404,
      message
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'Datos duplicados';
    
    // Extraer el campo duplicado
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    if (field === 'email') {
      message = `El email ${value} ya está registrado`;
    } else if (field === 'sku') {
      message = `El SKU ${value} ya existe`;
    } else {
      message = `El ${field} ${value} ya existe`;
    }
    
    error = {
      statusCode: 400,
      message
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = {
      statusCode: 400,
      message: 'Datos inválidos',
      errors: messages
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      statusCode: 401,
      message: 'Token inválido'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      statusCode: 401,
      message: 'Token expirado'
    };
  }

  // Multer errors (upload de archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      statusCode: 400,
      message: 'Archivo demasiado grande'
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      statusCode: 400,
      message: 'Demasiados archivos'
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      statusCode: 400,
      message: 'Tipo de archivo no permitido'
    };
  }

  // Error de conexión a base de datos
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    error = {
      statusCode: 503,
      message: 'Error de conexión a la base de datos'
    };
  }

  // Errores de Stripe
  if (err.type && err.type.startsWith('Stripe')) {
    error = {
      statusCode: 400,
      message: 'Error en el procesamiento del pago',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    };
  }

  // Error personalizado con statusCode
  if (err.statusCode) {
    error.statusCode = err.statusCode;
  }

  // Status code por defecto
  const statusCode = error.statusCode || 500;

  // Respuesta de error
  const errorResponse = {
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(error.errors && { errors: error.errors }),
    ...(error.details && { details: error.details })
  };

  // En desarrollo, incluir stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.originalError = {
      name: err.name,
      code: err.code,
      ...(err.keyValue && { keyValue: err.keyValue })
    };
  }

  // Log específico para errores 500
  if (statusCode === 500) {
    console.error('🔥 Error 500:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      user: req.user ? req.user._id : 'No autenticado'
    });
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;