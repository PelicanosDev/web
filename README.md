# 🏐 Pelícanos Vóley Club - Plataforma Web Completa

Plataforma web fullstack para la gestión integral de Pelícanos Vóley Club, el club de vóley playa líder en Manizales, Caldas, Colombia.

![Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contribución](#contribución)
- [Licencia](#licencia)

## 🎯 Descripción

Sistema completo de gestión para club deportivo que incluye:
- **Sitio público** con información del club, galería y contacto
- **Panel administrador** para gestión de miembros, eventos y torneos
- **Panel de miembro** con seguimiento deportivo y gamificación
- **Sistema de gamificación** con niveles, XP e insignias
- **Gestión de torneos** con llaves y resultados
- **Seguimiento de progreso** deportivo individual

## ✨ Características

### Sitio Público
- ✅ Landing page atractiva con animaciones
- ✅ Información del club (Historia, Misión, Visión, Valores)
- ✅ Galería de fotos con filtros
- ✅ Información de sedes y horarios
- ✅ Formulario de contacto
- ✅ Botón flotante de WhatsApp
- ✅ Diseño responsive y mobile-first

### Panel Administrador
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión completa de miembros (CRUD)
- ✅ Registro de métricas físicas
- ✅ Asignación de insignias
- ✅ Gestión de eventos y torneos
- ✅ Galería de imágenes
- ✅ Gráficos de crecimiento

### Panel de Miembro
- ✅ Dashboard personal con estadísticas
- ✅ Visualización de progreso deportivo
- ✅ Comparación inicio vs actual
- ✅ Sistema de niveles y XP
- ✅ Colección de insignias
- ✅ Historial de partidos
- ✅ Galería personal

### Sistema de Gamificación
- ✅ 10 niveles de progresión
- ✅ Sistema de XP por actividades
- ✅ Insignias por logros
- ✅ Rankings y leaderboards
- ✅ Milestones y recompensas

## 🛠 Stack Tecnológico

### Frontend
```
React 18.2
React Router DOM 6
Tailwind CSS 3
Framer Motion
Axios
Zustand
React Hook Form
Recharts
Lucide React
Day.js
```

### Backend
```
Node.js 18+
Express.js 4
MongoDB + Mongoose
JWT Authentication
bcrypt
Multer
Cloudinary
Joi Validation
Helmet.js
```

### DevOps & Tools
```
Vite
Git + GitHub
Postman
MongoDB Atlas
Cloudinary
```

## 🏗 Arquitectura

```
┌─────────────────────────────────────────┐
│           FRONTEND (React)              │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Público  │  │  Admin   │  │ Miembro││
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────┬───────────────────────┘
                  │ REST API
┌─────────────────▼───────────────────────┐
│         BACKEND (Express.js)            │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │  Routes  │  │Controllers│  │Middlew.││
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌────▼────┐   ┌───▼────┐
│MongoDB│   │Cloudinary│   │  JWT   │
└───────┘   └─────────┘   └────────┘
```

## 🚀 Instalación

### Requisitos Previos
- Node.js 18+ instalado
- MongoDB instalado o cuenta en MongoDB Atlas
- Cuenta en Cloudinary (para imágenes)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/pelicanos-app.git
cd pelicanos-app
```

### 2. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pelicanos
JWT_SECRET=tu-secret-key-aqui
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Editar `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP_NUMBER=+573001234567
```

### 4. Iniciar Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 📖 Uso

### Credenciales de Demo

**Administrador:**
- Email: `admin@pelicanos.co`
- Password: `Admin123!`

**Miembro:**
- Email: `member@pelicanos.co`
- Password: `Member123!`

### Flujos Principales

1. **Registro de Nuevo Miembro**
   - Admin crea usuario en `/admin/members`
   - Sistema genera número de miembro automático
   - Usuario recibe credenciales

2. **Seguimiento Deportivo**
   - Admin registra métricas físicas
   - Sistema calcula progreso automáticamente
   - Miembro visualiza evolución en dashboard

3. **Gestión de Torneos**
   - Admin crea torneo con detalles
   - Equipos se inscriben
   - Sistema genera llaves
   - Registro de resultados

## 📁 Estructura del Proyecto

```
pelicanos-app/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuraciones
│   │   ├── controllers/    # Controladores
│   │   ├── middlewares/    # Middlewares
│   │   ├── models/         # Modelos Mongoose
│   │   ├── routes/         # Rutas API
│   │   ├── utils/          # Utilidades
│   │   ├── app.js          # App Express
│   │   └── server.js       # Servidor
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── api/           # Axios config
│   │   ├── components/    # Componentes
│   │   ├── features/      # Features
│   │   ├── pages/         # Páginas
│   │   ├── routes/        # Rutas
│   │   ├── styles/        # Estilos
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── README.md
│
├── ARCHITECTURE.md         # Documentación técnica
└── README.md              # Este archivo
```

## 📡 API Documentation

### Endpoints Principales

**Autenticación**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

**Miembros (Admin)**
```
GET    /api/admin/members
GET    /api/admin/members/:id
POST   /api/admin/members
PUT    /api/admin/members/:id
POST   /api/admin/members/:id/records
POST   /api/admin/members/:id/badges
```

**Perfil de Miembro**
```
GET    /api/member/profile
GET    /api/member/stats
GET    /api/member/progress
GET    /api/member/badges
```

**Torneos**
```
GET    /api/tournaments
POST   /api/tournaments
PUT    /api/tournaments/:id
POST   /api/tournaments/:id/register
```

Ver documentación completa en `/backend/README.md`

## 🚀 Deployment

### Backend (Railway/Render)

1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático

### Frontend (Vercel/Netlify)

1. Conectar repositorio
2. Build command: `npm run build`
3. Output directory: `dist`
4. Configurar variables de entorno

### Variables de Entorno en Producción

**Backend:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-secret-key
CLOUDINARY_*=...
```

**Frontend:**
```
VITE_API_URL=https://api.pelicanos.co/api
```

## 🗺 Roadmap

### MVP ✅ (Completado)
- [x] Autenticación y autorización
- [x] CRUD de miembros
- [x] Dashboard admin
- [x] Dashboard miembro
- [x] Sitio público
- [x] Sistema de gamificación básico

### Versión 1.0 (En Progreso)
- [ ] Sistema completo de torneos
- [ ] Gestión de equipos
- [ ] Estadísticas avanzadas
- [ ] Galería con upload
- [ ] Sistema de eventos

### Futuras Mejoras
- [ ] Pagos en línea (PSE, tarjetas)
- [ ] Notificaciones push
- [ ] App móvil (React Native)
- [ ] Chat entre miembros
- [ ] Reserva de canchas online
- [ ] Streaming de partidos
- [ ] Análisis de video con IA

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más información.

## 👥 Equipo

**Daniel Castaño** - Founder & Head Coach
- Email: daniel@pelicanos.co

## 📞 Contacto

- **Website**: [www.pelicanos.co](https://www.pelicanos.co)
- **Email**: info@pelicanos.co
- **WhatsApp**: +57 300 123 4567
- **Instagram**: @pelicanosvoley
- **Facebook**: Pelícanos Vóley Club

---

Hecho con ❤️ por el equipo de Pelícanos Vóley Club
