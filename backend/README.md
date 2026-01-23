# Pelícanos Vóley Club - Backend API

Backend API REST para la plataforma de gestión del club de vóley playa Pelícanos.

## 🚀 Tecnologías

- **Node.js** - Runtime
- **Express.js** - Framework web
- **MongoDB** - Base de datos
- **Mongoose** - ODM
- **JWT** - Autenticación
- **Cloudinary** - Almacenamiento de imágenes
- **bcrypt** - Hashing de contraseñas

## 📋 Requisitos Previos

- Node.js 18+ instalado
- MongoDB instalado localmente o cuenta en MongoDB Atlas
- Cuenta en Cloudinary (para almacenamiento de imágenes)

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Configurar variables de entorno en `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pelicanos
JWT_SECRET=tu-secret-key-aqui
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 📚 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones (DB, Cloudinary)
│   ├── controllers/     # Lógica de negocio
│   ├── middlewares/     # Middlewares (auth, validation, error)
│   ├── models/          # Modelos de Mongoose
│   ├── routes/          # Rutas de la API
│   ├── utils/           # Utilidades (JWT, helpers)
│   ├── app.js           # Configuración de Express
│   └── server.js        # Punto de entrada
├── uploads/             # Archivos temporales
├── .env                 # Variables de entorno
├── .env.example         # Ejemplo de variables
└── package.json
```

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación:

1. **Login**: `POST /api/auth/login`
2. **Token**: Se envía en header `Authorization: Bearer <token>`
3. **Refresh**: `POST /api/auth/refresh`

### Roles
- `admin` - Acceso completo
- `coach` - Gestión de miembros y eventos
- `member` - Acceso a perfil personal

## 📡 Endpoints Principales

### Autenticación
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### Miembros (Admin)
```
GET    /api/admin/members
GET    /api/admin/members/:id
POST   /api/admin/members
PUT    /api/admin/members/:id
DELETE /api/admin/members/:id
POST   /api/admin/members/:id/records
POST   /api/admin/members/:id/badges
```

### Perfil de Miembro
```
GET    /api/member/profile
GET    /api/member/stats
GET    /api/member/progress
GET    /api/member/badges
GET    /api/member/matches
GET    /api/member/gallery
POST   /api/member/gallery
```

### Torneos
```
GET    /api/tournaments
GET    /api/tournaments/:id
POST   /api/tournaments
PUT    /api/tournaments/:id
DELETE /api/tournaments/:id
POST   /api/tournaments/:id/register
```

### Eventos
```
GET    /api/events
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
POST   /api/events/:id/register
```

### Galería
```
GET    /api/gallery
GET    /api/gallery/:id
POST   /api/gallery
PUT    /api/gallery/:id
DELETE /api/gallery/:id
POST   /api/gallery/:id/like
```

### Dashboard (Admin)
```
GET    /api/admin/dashboard/stats
GET    /api/admin/dashboard/growth
GET    /api/admin/dashboard/recent
GET    /api/admin/dashboard/events
```

## 🧪 Testing

```bash
npm test
```

## 📦 Deployment

### Railway / Render
1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático

### Variables de Entorno en Producción
- `NODE_ENV=production`
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key fuerte
- Credenciales de Cloudinary

## 🔒 Seguridad

- Helmet.js para headers HTTP seguros
- Rate limiting (100 requests/15min)
- CORS configurado
- Validación de inputs con Joi
- Passwords hasheados con bcrypt
- JWT con expiración

## 📝 Notas

- Los archivos subidos se almacenan temporalmente en `/uploads` y luego se suben a Cloudinary
- Las imágenes se optimizan automáticamente (max 1200x1200, calidad auto)
- Los tokens JWT expiran en 15 minutos (configurable)
- Los refresh tokens expiran en 7 días

## 🐛 Debugging

Ver logs en consola:
```bash
npm run dev
```

Health check:
```bash
curl http://localhost:5000/api/health
```

## 📄 Licencia

MIT - Pelícanos Vóley Club
