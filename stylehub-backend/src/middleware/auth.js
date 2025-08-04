const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware para autenticar usuarios
exports.authenticate = async (req, res, next) => {
  try {
    let token;

    // Obtener token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token de autorización requerido.'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Obtener usuario de la base de datos
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido. Usuario no encontrado.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Cuenta desactivada. Contacta al administrador.'
        });
      }

      // Agregar usuario a la request
      req.user = user;
      next();

    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado. Por favor inicia sesión nuevamente.'
        });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido.'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Error de autenticación.'
        });
      }
    }

  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Middleware para autorizar roles específicos
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Usuario no autenticado.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere rol de: ${roles.join(' o ')}`
      });
    }

    next();
  };
};

// Middleware opcional para rutas que pueden funcionar con o sin autenticación
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (tokenError) {
        // En auth opcional, ignoramos errores de token
        console.log('Token inválido en auth opcional:', tokenError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Error en middleware de auth opcional:', error);
    next(); // Continuamos sin usuario autenticado
  }
};

// Middleware para verificar ownership (el usuario puede acceder solo a sus propios recursos)
exports.checkOwnership = (resourceUserField = 'user') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Acceso denegado. Usuario no autenticado.'
        });
      }

      // Los admins pueden acceder a cualquier recurso
      if (req.user.role === 'admin') {
        return next();
      }

      // Para otros usuarios, verificar ownership
      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'ID de recurso requerido.'
        });
      }

      // Aquí puedes agregar lógica específica para diferentes modelos
      // Por ahora, asumimos que el campo 'user' en el recurso debe coincidir
      next();

    } catch (error) {
      console.error('Error en middleware de ownership:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Middleware para verificar si el email está verificado
exports.requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. Usuario no autenticado.'
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email no verificado. Por favor verifica tu email antes de continuar.'
    });
  }

  next();
};

// Middleware para rate limiting específico por usuario
exports.userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requestCounts = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpiar requests antiguos
    if (requestCounts.has(userId)) {
      const userRequests = requestCounts.get(userId);
      const recentRequests = userRequests.filter(time => time > windowStart);
      requestCounts.set(userId, recentRequests);
    }

    // Obtener requests actuales del usuario
    const userRequests = requestCounts.get(userId) || [];

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Agregar request actual
    userRequests.push(now);
    requestCounts.set(userId, userRequests);

    next();
  };
};