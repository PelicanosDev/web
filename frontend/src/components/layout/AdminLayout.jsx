import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Image,
  Calendar,
  Trophy,
  Award,
  Dumbbell,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/images/Logo.png';

const menuItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Miembros', path: '/admin/members', icon: Users },
  { name: 'Ejercicios', path: '/admin/exercises', icon: Dumbbell },
  { name: 'Galería', path: '/admin/gallery', icon: Image },
  { name: 'Eventos', path: '/admin/events', icon: Calendar },
  { name: 'Torneos', path: '/admin/tournaments', icon: Trophy },
  { name: 'Insignias', path: '/admin/badges', icon: Award },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) =>
    path === '/admin' ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const initials =
    `${user?.profile?.firstName?.[0] || ''}${user?.profile?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── SIDEBAR ── */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-300`}
      >
        {/* Top accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />

        {/* Logo */}
        <div className="pl-5 pr-4 py-5 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-white p-1.5 flex-shrink-0">
              <img src={logo} alt="Pelícanos" className="h-7 w-auto" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm uppercase tracking-wide leading-tight">
                Pelícanos Vóley
              </p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Admin</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                isActive(path)
                  ? 'bg-primary-500 text-white font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-display font-bold uppercase tracking-wide text-sm">{name}</span>
              {isActive(path) && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-800 p-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-primary-500 flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-white text-sm">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-display font-bold uppercase tracking-wide text-sm">Salir</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen md:ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden sm:block text-xs font-bold uppercase tracking-widest text-slate-400">
                Panel Administrativo
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-40"
        />
      )}
    </div>
  );
}

export default AdminLayout;
