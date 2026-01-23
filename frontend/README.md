# Pelícanos Vóley Club - Frontend

Frontend de la plataforma web para Pelícanos Vóley Club construido con React, Tailwind CSS y Vite.

## 🚀 Tecnologías

- **React 18** - Biblioteca UI
- **React Router DOM** - Navegación
- **Tailwind CSS** - Estilos
- **Framer Motion** - Animaciones
- **Axios** - Cliente HTTP
- **Zustand** - Gestión de estado
- **React Hook Form** - Manejo de formularios
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconos
- **Day.js** - Manejo de fechas

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Backend API ejecutándose (ver `/backend/README.md`)

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Configurar variables de entorno:
```env
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP_NUMBER=+573001234567
VITE_CLUB_EMAIL=info@pelicanos.co
VITE_CLUB_PHONE=+573001234567
```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para Producción
```bash
npm run build
```

### Preview del Build
```bash
npm run preview
```

## 📚 Estructura del Proyecto

```
frontend/
├── src/
│   ├── api/                 # Configuración de Axios
│   ├── assets/              # Imágenes y recursos estáticos
│   ├── components/          # Componentes reutilizables
│   │   ├── common/          # Componentes comunes
│   │   └── layout/          # Layouts (Navbar, Footer, etc.)
│   ├── features/            # Features por módulo
│   │   └── auth/            # Autenticación
│   ├── pages/               # Páginas de la aplicación
│   │   ├── public/          # Páginas públicas
│   │   ├── admin/           # Panel administrador
│   │   ├── member/          # Panel miembro
│   │   └── auth/            # Login
│   ├── routes/              # Configuración de rutas
│   ├── styles/              # Estilos globales
│   ├── utils/               # Utilidades
│   ├── App.jsx              # Componente principal
│   └── main.jsx             # Punto de entrada
├── public/                  # Archivos públicos
├── index.html               # HTML principal
├── vite.config.js           # Configuración de Vite
├── tailwind.config.js       # Configuración de Tailwind
└── package.json
```

## 🎨 Rutas de la Aplicación

### Públicas
- `/` - Home
- `/about` - Nosotros
- `/venues` - Sedes
- `/gallery` - Galería
- `/contact` - Contacto
- `/login` - Iniciar sesión

### Admin (requiere autenticación)
- `/admin` - Dashboard
- `/admin/members` - Gestión de miembros
- `/admin/members/:id` - Detalle de miembro
- `/admin/gallery` - Gestión de galería
- `/admin/events` - Gestión de eventos
- `/admin/tournaments` - Gestión de torneos
- `/admin/badges` - Gestión de insignias

### Miembro (requiere autenticación)
- `/member` - Dashboard personal
- `/member/profile` - Mi perfil

## 🎨 Sistema de Diseño

### Colores
- **Primary**: Naranja (#f97316) - Color principal del club
- **Ocean**: Azul (#0ea5e9) - Representa el vóley playa
- **Sand**: Amarillo (#eab308) - Arena de la cancha

### Componentes Reutilizables

#### Botones
```jsx
<button className="btn btn-primary">Primary Button</button>
<button className="btn btn-secondary">Secondary Button</button>
<button className="btn btn-outline">Outline Button</button>
```

#### Cards
```jsx
<div className="card">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>
```

#### Badges
```jsx
<span className="badge badge-success">Active</span>
<span className="badge badge-warning">Pending</span>
<span className="badge badge-error">Inactive</span>
```

## 🔐 Autenticación

La aplicación usa JWT para autenticación:

1. El usuario inicia sesión en `/login`
2. El token se almacena en localStorage
3. Axios interceptor agrega el token a todas las peticiones
4. Rutas protegidas verifican autenticación y rol

### Roles
- `admin` - Acceso completo al panel de administración
- `coach` - Acceso a gestión de miembros y eventos
- `member` - Acceso al panel personal

## 📱 Responsive Design

La aplicación es completamente responsive:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎭 Animaciones

Usando Framer Motion para:
- Transiciones de página
- Animaciones de entrada
- Hover effects
- Modal animations

Ejemplo:
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

## 🔧 Configuración de Tailwind

Colores personalizados, fuentes y animaciones están configurados en `tailwind.config.js`.

## 📦 Build y Deploy

### Vercel (Recomendado)
1. Conectar repositorio en Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

### Netlify
1. Conectar repositorio
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configurar variables de entorno

### Variables de Entorno en Producción
```
VITE_API_URL=https://api.pelicanos.co/api
VITE_WHATSAPP_NUMBER=+573001234567
VITE_CLUB_EMAIL=info@pelicanos.co
VITE_CLUB_PHONE=+573001234567
```

## 🐛 Debugging

### Herramientas de Desarrollo
- React DevTools
- Redux DevTools (si se usa)
- Network tab para peticiones API

### Logs
Los errores se muestran en la consola del navegador.

## 🎯 Mejoras Futuras

- [ ] PWA (Progressive Web App)
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] Tests unitarios (Jest + React Testing Library)
- [ ] Tests E2E (Playwright)
- [ ] Optimización de imágenes
- [ ] Service Workers para caché
- [ ] Notificaciones push

## 📄 Licencia

MIT - Pelícanos Vóley Club
