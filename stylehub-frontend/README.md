# 🛍️ StyleHub - E-commerce de Moda

es una plataforma de comercio electrónico enfocada en la venta de ropa y accesorios de moda. Su objetivo es ofrecer una experiencia de compra moderna, intuitiva y eficiente, integrando tecnologías actuales tanto en frontend como en backend.

---

##  Autores

- Ángel Joshue Conforme Anchundia  
- Yeiker Alexander López Pachay  
- Patricia Elizabeth Macías Majojo  
- Lenin Alexander Suárez Carrera  
- Xavier Santana Parrales


---

## Tecnologías Utilizadas

| Capa         | Tecnología                     |
|--------------|--------------------------------|
| **Frontend** | React 18 + React Router        |
| **Backend**  | Node.js 18+                    |
| **Base de Datos** | PostgreSQL               |
| **DevOps**   | Docker + Docker Compose        |
| **CI/CD**    | GitHub Actions                 |
| **Cloud**    | Vercel (Frontend) + Supabase   |
| **HTTP Client** | Axios                       |
| **Pasarelas de Pago** | Stripe y PayPal       |

---

##  Estructura del Proyecto

```
stylehub/
├── src/
│   ├── modules/
│   │   ├── auth/           # Autenticación y autorización
│   │   ├── products/       # Gestión de productos
│   │   ├── cart/           # Carrito de compras
│   │   ├── orders/         # Procesamiento de órdenes
│   │   ├── payments/       # Integración con pasarelas
│   │   ├── users/          # Gestión de usuarios
│   │   └── notifications/  # Sistema de notificaciones
│   ├── shared/
│   │   ├── config/         # Configuración
│   │   ├── utils/          # Utilidades
│   │   └── middleware/     # Middlewares
│   └── infrastructure/
│       ├── database/       # Conexión DB
│       ├── cache/          # Redis
│       └── external/       # APIs externas
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── redux/
│       └── App.jsx
├── docs/
│   ├── arquitectura.md
│   ├── diagramas/
│   └── adr/
├── .github/
│   └── workflows/
│       └── ci.yml
└── README.md
```

---

##  Funcionalidades Planeadas

-  Catálogo de productos con categorías y filtros
-  Búsqueda avanzada
-  Carrito de compras persistente
-  Checkout con Stripe y PayPal
-  Panel de administración (CRUD, inventario, pedidos)
-  Notificaciones por email
-  Analytics básicos para admins

---

##  Arquitectura

El proyecto sigue una **arquitectura monolítica modular**, con separación por capas y responsabilidades, ideal para equipos pequeños y desarrollo rápido de MVP.

###  Modelos C4 implementados:
- C1 – Diagrama de contexto
- C2 – Diagrama de contenedores
- C3 – Componentes por servicios
- ADRs – Registro de decisiones arquitectónicas clave


---

##  Patrones de Diseño

Se implementarán los siguientes patrones:

- `Factory Method`: Para crear pasarelas de pago
- `Singleton`: Configuración centralizada
- `Repository`: Acceso a datos desacoplado
- `Strategy`: Estrategias de envío y pagos

---

##  Plan de Desarrollo

###  Fase 1: MVP
- Configuración inicial (Node.js + React)
- CRUD de productos
- Autenticación simple
- Carrito básico

###  Fase 2: Funcionalidades Core
- Filtros de productos
- Checkout completo con Stripe
- Panel de administración

###  Fase 3: Optimización y Despliegue
- Integración con PayPal
- Tests + SonarQube
- Despliegue en la nube (Vercel/Supabase)

---

##  Docker y CI/CD

- Contenedores definidos con **Docker** y **Docker Compose**
- Pipeline automatizado con **GitHub Actions**:
  - Tests
  - Lint
  - Quality Gates (>70% coverage)
  - Despliegue automático a staging/production

---


##  Enlace del Repositorio

https://github.com/JeremySantana99/ProyectoFinal_ARQ.git

---

