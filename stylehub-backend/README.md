# 🛍️ StyleHub Backend API

API REST completa para la plataforma de e-commerce StyleHub, desarrollada con Node.js, Express y MongoDB.

## 🚀 Características

- **Autenticación JWT** con registro y login
- **CRUD completo** de productos y categorías
- **Sistema de carrito** con persistencia
- **Gestión de órdenes** y estados
- **Sistema de roles** (cliente/admin)
- **Validación robusta** de datos
- **Rate limiting** y seguridad
- **API RESTful** bien documentada

## 📋 Requisitos Previos

- Node.js 16+
- MongoDB 4.4+
- npm o yarn

## 🛠️ Instalación

### 1. Clonar y configurar el proyecto

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd stylehub-backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env
```

### 2. Configurar variables de entorno

Edita el archivo `.env` con tus configuraciones:

```bash
# Configuración básica
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Base de datos
MONGODB_URI=mongodb://localhost:27017/stylehub

# JWT
JWT_SECRET=tu_super_secreto_jwt_key_aqui
JWT_EXPIRE=7d
```

### 3. Inicializar la base de datos

```bash
# Poblar la base de datos con datos de ejemplo
npm run seed
```

### 4. Iniciar el servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:5000`

## 📚 Documentación de la API

### 🔐 Autenticación

#### Registro de usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "password": "Password123!",
  "phone": "+593999123456"
}
```

#### Inicio de sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

#### Obtener perfil (requiere token)
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 📦 Productos

#### Listar productos con filtros
```http
GET /api/products?page=1&limit=12&category=<categoryId>&search=camiseta&sortBy=price-low&minPrice=10&maxPrice=100
```

#### Obtener producto específico
```http
GET /api/products/:id
```

#### Crear producto (solo admin)
```http
POST /api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Producto Ejemplo",
  "description": "Descripción del producto",
  "price": 29.99,
  "originalPrice": 39.99,
  "category": "<categoryId>",
  "colors": ["Rojo", "Azul"],
  "sizes": ["S", "M", "L"],
  "stock": 100,
  "brand": "StyleHub"
}
```

### 🛒 Carrito

#### Obtener carrito del usuario
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Agregar producto al carrito
```http
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "<productId>",
  "quantity": 2,
  "selectedColor": "Rojo",
  "selectedSize": "M"
}
```

#### Actualizar cantidad en el carrito
```http
PUT /api/cart/items/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Aplicar cupón de descuento
```http
POST /api/cart/coupon
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "WELCOME10"
}
```

### 📁 Categorías

#### Listar categorías
```http
GET /api/categories
```

#### Crear categoría (solo admin)
```http
POST /api/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Nueva Categoría",
  "description": "Descripción de la categoría",
  "sortOrder": 5
}
```

## 🔒 Roles y Permisos

### Cliente (customer)
- ✅ Ver productos y categorías
- ✅ Gestionar carrito personal
- ✅ Crear órdenes
- ✅ Ver historial de órdenes
- ✅ Actualizar perfil

### Administrador (admin)
- ✅ Todas las funciones de cliente
- ✅ CRUD de productos
- ✅ CRUD de categorías
- ✅ Ver todas las órdenes
- ✅ Actualizar estados de órdenes
- ✅ Ver estadísticas

## 🛡️ Seguridad

- **Rate Limiting**: 100 requests por 15 minutos por IP
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para el frontend
- **Validación**: Validación robusta con express-validator
- **Hash de contraseñas**: bcryptjs con salt 12
- **JWT**: Tokens seguros con expiración

## 📊 Base de Datos

### Modelos principales:

- **User**: Usuarios del sistema
- **Product**: Productos del catálogo
- **Category**: Categorías de productos
- **Cart**: Carritos de compras
- **Order**: Órdenes de compra

### Índices optimizados para:
- Búsqueda de texto en productos
- Filtros por categoría y precio
- Consultas de carrito por usuario
- Ordenamiento por rating y fecha

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch
```

## 📈 Monitoreo y Logs

El servidor incluye:
- **Morgan**: Logging de requests HTTP
- **Error handling**: Manejo centralizado de errores
- **Health check**: Endpoint `/health` para monitoreo

## 🚀 Despliegue

### Configuración para producción:

```bash
# Variables de entorno para producción
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/stylehub
JWT_SECRET=super_secreto_seguro_cambiar
```

### Scripts de deployment:

```bash
# Build para producción
npm run build

# Iniciar en producción
npm start
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte o preguntas:
- Email: support@stylehub.com
- Issues: [GitHub Issues]

---

## 📋 Cupones de Ejemplo

Para testing, puedes usar estos cupones:

- `WELCOME10`: 10% de descuento, sin monto mínimo
- `SAVE20`: 20% de descuento, mínimo $50
- `FIRST5`: $5 de descuento fijo, mínimo $25

## 🔑 Credenciales por Defecto

Después del seeding:

**Administrador:**
- Email: `admin@stylehub.com`
- Password: `Admin123!`

**Cliente:**
- Email: `juan@example.com`
- Password: `Customer123!`

---

Desarrollado con ❤️ para StyleHub