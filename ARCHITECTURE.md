# Arquitectura Técnica - Pelícanos Vóley Club

## 1. Visión General del Sistema

Plataforma web fullstack para gestión integral de club de vóley playa con tres interfaces principales:
- **Sitio Público**: Marketing, información del club y captación de miembros
- **Panel Administrador**: Gestión completa del club, miembros, eventos y contenido
- **Panel Miembro**: Seguimiento deportivo personal, gamificación y comunidad

## 2. Stack Tecnológico

### Frontend
- **Framework**: React 18+ (JavaScript)
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS 3+
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Dates**: Day.js
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **Validation**: Joi
- **CORS**: cors
- **Environment**: dotenv

### Base de Datos
- **Database**: MongoDB 6+
- **ODM**: Mongoose
- **Justificación**: 
  - Flexibilidad en esquemas para datos deportivos variables
  - Excelente para datos anidados (historial, insignias, eventos)
  - Escalabilidad horizontal natural
  - Menor complejidad inicial vs PostgreSQL para este caso de uso

### Cloud & Storage
- **File Storage**: Cloudinary (imágenes optimizadas automáticamente)
- **Deployment**: 
  - Frontend: Vercel/Netlify
  - Backend: Railway/Render
  - Database: MongoDB Atlas

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Público    │  │    Admin     │  │   Miembro    │      │
│  │   (React)    │  │   (React)    │  │   (React)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │   API REST    │
                    │  (Express.js) │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐      ┌──────▼──────┐    ┌──────▼──────┐
   │ MongoDB │      │  Cloudinary │    │     JWT     │
   │ (Atlas) │      │   (Images)  │    │    Auth     │
   └─────────┘      └─────────────┘    └─────────────┘
```

## 4. Modelo de Datos

### 4.1 User Schema
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['admin', 'member', 'coach']),
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String (URL)
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 Member Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  memberNumber: String (unique),
  personalInfo: {
    birthDate: Date,
    gender: String (enum: ['M', 'F']),
    address: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  membership: {
    plan: String,
    monthlyFee: Number,
    startDate: Date,
    status: String (enum: ['active', 'inactive', 'suspended']),
    paymentHistory: [{
      date: Date,
      amount: Number,
      method: String,
      status: String
    }]
  },
  sportProfile: {
    position: String (enum: ['setter', 'hitter', 'blocker', 'libero', 'all-around']),
    dominantHand: String (enum: ['right', 'left', 'both']),
    experience: String (enum: ['beginner', 'intermediate', 'advanced', 'professional']),
    schedule: [String]
  },
  physicalRecords: [{
    date: Date,
    height: Number,
    weight: Number,
    wingspan: Number,
    verticalJump: Number,
    serveSpeed: Number,
    spikeSpeed: Number,
    notes: String,
    recordedBy: ObjectId (ref: 'User')
  }],
  gamification: {
    level: Number,
    xp: Number,
    badges: [{
      badgeId: ObjectId (ref: 'Badge'),
      earnedAt: Date,
      progress: Number
    }],
    achievements: [{
      type: String,
      title: String,
      date: Date
    }]
  },
  attendance: [{
    date: Date,
    present: Boolean,
    sessionType: String
  }],
  matches: [{
    matchId: ObjectId (ref: 'Match'),
    tournamentId: ObjectId (ref: 'Tournament'),
    date: Date,
    result: String,
    stats: {
      points: Number,
      aces: Number,
      blocks: Number,
      digs: Number
    }
  }],
  gallery: [{
    imageUrl: String,
    caption: String,
    uploadedAt: Date,
    eventId: ObjectId (ref: 'Event')
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 4.3 Tournament Schema
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String (enum: ['masculine', 'feminine', 'mixed']),
  level: String (enum: ['recreational', 'amateur', 'professional']),
  format: String (enum: ['2v2', '4v4', '6v6']),
  dates: {
    start: Date,
    end: Date,
    registrationDeadline: Date
  },
  location: {
    venue: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: String (enum: ['upcoming', 'registration', 'in-progress', 'completed', 'cancelled']),
  rules: String,
  prizes: [{
    position: String,
    description: String,
    value: Number
  }],
  teams: [{
    teamId: ObjectId (ref: 'Team'),
    registrationDate: Date,
    status: String
  }],
  matches: [{
    matchId: ObjectId (ref: 'Match')
  }],
  coverImage: String,
  gallery: [String],
  organizer: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### 4.4 Event Schema
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  type: String (enum: ['training', 'tournament', 'social', 'workshop', 'other']),
  date: Date,
  endDate: Date,
  location: String,
  isPublic: Boolean,
  coverImage: String,
  participants: [{
    memberId: ObjectId (ref: 'Member'),
    status: String (enum: ['confirmed', 'pending', 'cancelled'])
  }],
  maxParticipants: Number,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### 4.5 Badge Schema
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  icon: String,
  category: String (enum: ['attendance', 'performance', 'achievement', 'special']),
  criteria: {
    type: String,
    value: Number,
    description: String
  },
  rarity: String (enum: ['common', 'rare', 'epic', 'legendary']),
  isActive: Boolean,
  createdAt: Date
}
```

### 4.6 GalleryItem Schema
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  imageUrl: String,
  thumbnailUrl: String,
  category: String (enum: ['tournament', 'training', 'social', 'facilities']),
  tags: [String],
  eventId: ObjectId (ref: 'Event'),
  uploadedBy: ObjectId (ref: 'User'),
  isPublic: Boolean,
  likes: [ObjectId (ref: 'User')],
  createdAt: Date
}
```

### 4.7 Match Schema
```javascript
{
  _id: ObjectId,
  tournamentId: ObjectId (ref: 'Tournament'),
  round: String,
  matchNumber: Number,
  date: Date,
  teams: [{
    teamId: ObjectId (ref: 'Team'),
    score: Number,
    isWinner: Boolean
  }],
  sets: [{
    setNumber: Number,
    scores: [Number]
  }],
  status: String (enum: ['scheduled', 'in-progress', 'completed', 'postponed']),
  stats: Object,
  createdAt: Date
}
```

### 4.8 Team Schema
```javascript
{
  _id: ObjectId,
  name: String,
  members: [{
    memberId: ObjectId (ref: 'Member'),
    role: String (enum: ['captain', 'player'])
  }],
  category: String,
  wins: Number,
  losses: Number,
  createdAt: Date
}
```

## 5. API REST Endpoints

### 5.1 Authentication
```
POST   /api/auth/register          - Registro de nuevo usuario
POST   /api/auth/login             - Login
POST   /api/auth/refresh           - Refresh token
POST   /api/auth/logout            - Logout
POST   /api/auth/forgot-password   - Recuperar contraseña
POST   /api/auth/reset-password    - Resetear contraseña
```

### 5.2 Users
```
GET    /api/users/me               - Perfil del usuario actual
PUT    /api/users/me               - Actualizar perfil
PUT    /api/users/me/password      - Cambiar contraseña
POST   /api/users/me/avatar        - Subir avatar
```

### 5.3 Members (Admin)
```
GET    /api/admin/members          - Listar miembros (filtros, paginación)
GET    /api/admin/members/:id      - Detalle de miembro
POST   /api/admin/members          - Crear miembro
PUT    /api/admin/members/:id      - Actualizar miembro
DELETE /api/admin/members/:id      - Eliminar miembro
POST   /api/admin/members/:id/records  - Agregar registro físico
PUT    /api/admin/members/:id/membership - Actualizar membresía
POST   /api/admin/members/:id/badges - Asignar insignia
```

### 5.4 Member Profile
```
GET    /api/member/profile         - Mi perfil deportivo
GET    /api/member/stats           - Mis estadísticas
GET    /api/member/progress        - Mi progreso (comparación)
GET    /api/member/badges          - Mis insignias
GET    /api/member/matches         - Mis partidos
GET    /api/member/gallery         - Mi galería
POST   /api/member/gallery         - Subir foto personal
```

### 5.5 Tournaments
```
GET    /api/tournaments            - Listar torneos (público)
GET    /api/tournaments/:id        - Detalle de torneo
POST   /api/admin/tournaments      - Crear torneo (admin)
PUT    /api/admin/tournaments/:id  - Actualizar torneo (admin)
DELETE /api/admin/tournaments/:id  - Eliminar torneo (admin)
POST   /api/tournaments/:id/register - Inscribir equipo
GET    /api/tournaments/:id/brackets - Ver llaves
```

### 5.6 Events
```
GET    /api/events                 - Listar eventos
GET    /api/events/:id             - Detalle de evento
POST   /api/admin/events           - Crear evento (admin)
PUT    /api/admin/events/:id       - Actualizar evento (admin)
DELETE /api/admin/events/:id       - Eliminar evento (admin)
POST   /api/events/:id/register    - Registrarse a evento
```

### 5.7 Gallery
```
GET    /api/gallery                - Galería pública
GET    /api/gallery/:id            - Detalle de imagen
POST   /api/admin/gallery          - Subir imagen (admin)
PUT    /api/admin/gallery/:id      - Actualizar imagen (admin)
DELETE /api/admin/gallery/:id      - Eliminar imagen (admin)
POST   /api/gallery/:id/like       - Like a imagen
```

### 5.8 Badges
```
GET    /api/badges                 - Listar insignias
GET    /api/badges/:id             - Detalle de insignia
POST   /api/admin/badges           - Crear insignia (admin)
PUT    /api/admin/badges/:id       - Actualizar insignia (admin)
DELETE /api/admin/badges/:id       - Eliminar insignia (admin)
```

### 5.9 Dashboard (Admin)
```
GET    /api/admin/dashboard/stats  - Estadísticas generales
GET    /api/admin/dashboard/growth - Crecimiento de membresía
GET    /api/admin/dashboard/revenue - Ingresos
GET    /api/admin/dashboard/recent - Registros recientes
```

### 5.10 Public
```
GET    /api/public/info            - Información del club
GET    /api/public/venues          - Sedes
GET    /api/public/gallery         - Galería pública
GET    /api/public/events          - Eventos públicos
POST   /api/public/contact         - Formulario de contacto
```

## 6. Middlewares

### 6.1 Authentication Middleware
```javascript
// Verifica JWT token
authenticate(req, res, next)
```

### 6.2 Authorization Middleware
```javascript
// Verifica roles
authorize(...roles)(req, res, next)
```

### 6.3 Validation Middleware
```javascript
// Valida request body con Joi
validate(schema)(req, res, next)
```

### 6.4 Error Handler Middleware
```javascript
// Manejo centralizado de errores
errorHandler(err, req, res, next)
```

### 6.5 Upload Middleware
```javascript
// Configuración de Multer
uploadImage(fieldName, maxSize)
```

## 7. Seguridad

### 7.1 Autenticación
- JWT con refresh tokens
- Tokens almacenados en httpOnly cookies
- Expiración: Access token (15min), Refresh token (7 días)

### 7.2 Autorización
- Role-based access control (RBAC)
- Roles: admin, member, coach
- Protección de rutas por rol

### 7.3 Validación
- Joi schemas para todos los endpoints
- Sanitización de inputs
- Validación de tipos de archivo

### 7.4 Protección
- Helmet.js para headers HTTP
- Rate limiting (express-rate-limit)
- CORS configurado
- MongoDB injection prevention

### 7.5 Passwords
- bcrypt con salt rounds: 10
- Política de contraseñas: mínimo 8 caracteres

## 8. Flujos de Usuario

### 8.1 Registro de Nuevo Miembro
1. Admin crea usuario en panel
2. Sistema genera credenciales temporales
3. Email de bienvenida con link de activación
4. Usuario establece contraseña
5. Acceso a panel de miembro

### 8.2 Seguimiento Deportivo
1. Miembro ingresa a su perfil
2. Ve comparación inicio vs actual
3. Visualiza gráficos de progreso
4. Revisa próximos hitos para badges
5. Consulta historial de partidos

### 8.3 Gestión de Torneo
1. Admin crea torneo
2. Define categoría, fechas, reglas
3. Equipos se inscriben
4. Admin genera llaves
5. Registra resultados
6. Sistema actualiza estadísticas de miembros
7. Asigna badges automáticamente

### 8.4 Gamificación
1. Sistema calcula XP por:
   - Asistencia a entrenamientos
   - Participación en torneos
   - Victorias
   - Mejoras en métricas físicas
2. Al alcanzar umbral: level up
3. Desbloqueo de badges por criterios
4. Notificación al miembro

## 9. Gamificación - Sistema de Niveles

### 9.1 Niveles y XP
```javascript
Nivel 1: Rookie (0-500 XP)
Nivel 2: Beginner (501-1200 XP)
Nivel 3: Player (1201-2500 XP)
Nivel 4: Competitor (2501-4500 XP)
Nivel 5: Rising Star (4501-7500 XP)
Nivel 6: All-Star (7501-12000 XP)
Nivel 7: Champion (12001-18000 XP)
Nivel 8: Elite (18001-25000 XP)
Nivel 9: Legend (25001-35000 XP)
Nivel 10: Icon (35001+ XP)
```

### 9.2 Obtención de XP
- Asistencia a entrenamiento: 50 XP
- Victoria en partido amistoso: 100 XP
- Victoria en torneo: 200 XP
- Mejora en métrica física: 75 XP
- Participación en evento: 50 XP
- Completar perfil: 100 XP (una vez)

### 9.3 Categorías de Badges
- **Asistencia**: Dedicated, Iron Will, Never Miss
- **Performance**: Ace Master, Block King, Spike Queen
- **Logros**: First Win, Tournament Champion, MVP
- **Especiales**: Founder, Team Player, Coach's Choice

### 9.4 Rankings
- Por nivel
- Por victorias
- Por asistencia
- Por mejora en métricas

## 10. Escalabilidad

### 10.1 Base de Datos
- Índices en campos frecuentemente consultados
- Paginación en todas las listas
- Agregaciones optimizadas
- Caché con Redis (futuro)

### 10.2 API
- Rate limiting por usuario
- Compresión de respuestas (gzip)
- Lazy loading de imágenes
- CDN para assets estáticos

### 10.3 Frontend
- Code splitting por rutas
- Lazy loading de componentes
- Optimización de imágenes (Cloudinary)
- Service Workers (PWA - futuro)

### 10.4 Monitoreo
- Logs estructurados (Winston)
- Error tracking (Sentry - futuro)
- Performance monitoring
- Analytics (Google Analytics)

## 11. Roadmap

### MVP (Fase 1) - 4-6 semanas
- ✅ Autenticación básica
- ✅ CRUD de miembros
- ✅ Perfil deportivo básico
- ✅ Galería pública
- ✅ Sitio público
- ✅ Dashboard admin básico

### Versión 1.0 (Fase 2) - 8-10 semanas
- ✅ Sistema completo de torneos
- ✅ Gamificación completa
- ✅ Estadísticas avanzadas
- ✅ Sistema de eventos
- ✅ Galería personal de miembros

### Futuras Mejoras (Fase 3+)
- 🔄 Pagos en línea (PSE, tarjetas)
- 🔄 Notificaciones push
- 🔄 App móvil (React Native)
- 🔄 Chat entre miembros
- 🔄 Reserva de canchas online
- 🔄 Streaming de partidos
- 🔄 Análisis de video con IA
- 🔄 Marketplace de productos
- 🔄 Sistema de referidos
- 🔄 Integración con redes sociales

## 12. Consideraciones de Negocio

### 12.1 Monetización Futura
- Membresías premium
- Venta de productos branded
- Patrocinios en torneos
- Publicidad en sitio público
- Servicios de coaching privado

### 12.2 Marketing
- SEO optimizado en sitio público
- Blog de contenido deportivo
- Integración con redes sociales
- Email marketing para eventos
- Programa de referidos

### 12.3 Retención
- Gamificación para engagement
- Eventos regulares
- Reconocimiento público de logros
- Comunidad activa
- Contenido educativo

## 13. Métricas de Éxito

### 13.1 KPIs Técnicos
- Uptime > 99.5%
- Response time < 500ms
- Error rate < 1%
- Page load < 3s

### 13.2 KPIs de Negocio
- Tasa de retención de miembros
- Nuevos registros mensuales
- Engagement en plataforma
- Participación en eventos
- NPS (Net Promoter Score)

## 14. Tecnologías Complementarias

### 14.1 Desarrollo
- ESLint + Prettier (code quality)
- Husky (git hooks)
- Jest + React Testing Library (testing)
- Postman (API testing)

### 14.2 DevOps
- Git + GitHub
- GitHub Actions (CI/CD)
- Docker (containerización - futuro)
- Environment variables management

### 14.3 Comunicación
- WhatsApp Business API (futuro)
- SendGrid (emails transaccionales)
- Twilio (SMS - futuro)
