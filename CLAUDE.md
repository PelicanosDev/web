# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pelícanos Vóley Club — a fullstack MERN web platform for managing a beach volleyball club in Manizales, Colombia. Three distinct interfaces: a public-facing site, an admin panel, and a member panel.

## Development Commands

### Backend (run from `backend/`)
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production start
npm test         # Jest tests (watch mode)
```

### Frontend (run from `frontend/`)
```bash
npm run dev      # Vite dev server at http://localhost:5173
npm run build    # Production build → dist/
npm run lint     # ESLint on .js/.jsx files
npm run preview  # Preview production build at :4173
```

Both must run simultaneously for full-stack development. The Vite dev server proxies `/api` requests to `http://localhost:5000`.

## Environment Setup

**Backend** (`backend/.env`):
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pelicanos
JWT_SECRET=<secret>
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP_NUMBER=+573001234567
```

## Architecture

### Frontend
- **Path alias**: `@/` maps to `frontend/src/` (configured in `vite.config.js`)
- **Routing**: `frontend/src/routes/AppRouter.jsx` — three route groups wrapped in layout components: `PublicLayout`, `AdminLayout`, `MemberLayout`
- **Auth**: `AuthContext` in `frontend/src/features/auth/context/AuthContext.jsx` — stores token/refreshToken/user in `localStorage`. The axios instance at `frontend/src/api/axios.js` attaches the Bearer token and handles 401→refresh automatically.
- **State**: Zustand for global state; React Hook Form for forms; Recharts for charts
- **Roles**: `admin`/`coach` → `/admin/*`, `member` → `/member/*`, public → `/`

### Backend
- **Entry**: `backend/src/server.js` → `backend/src/app.js`
- **Pattern**: Routes → Controllers → Models (Mongoose); Joi validation via `validate` middleware before controllers
- **Auth middleware**: `authenticate` (JWT verify) + `authorize(...roles)` in `backend/src/middlewares/auth.js`
- **File uploads**: Multer (`backend/src/middlewares/upload.js`) then Cloudinary
- **Mixed route mounting**: Some routes are mounted twice (e.g., tournaments is mounted at both `/api/tournaments` and `/api/admin/tournaments`); authorization is enforced inside controllers/middleware, not by mount path alone

### Key Data Model Relationships
- `User` (auth) ↔ `Member` (sports profile) — linked via `userId`
- `Member` embeds: `physicalRecords[]`, `gamification` (level/XP/badges), `attendance[]`, `matches[]`, `gallery[]`
- `Tournament` → `Team[]` → `Member[]`; results trigger XP/badge logic

### Gamification
- 10 XP levels from Rookie (0 XP) to Icon (35001+ XP)
- Badge categories: attendance, performance, achievement, special
- XP sources: 50 (training/attendance/event), 75 (physical improvement), 100 (friendly win/profile complete), 200 (tournament win)
