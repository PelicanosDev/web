import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Home, User, Calendar, Trophy, LogOut, Menu, X, Image, ChevronRight, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import logo from '@/assets/images/Logo.png';
import axios from '@/api/axios';

const menuItems = [
  { name: 'Dashboard', path: '/member', icon: Home },
  { name: 'Mi Perfil', path: '/member/profile', icon: User },
  { name: 'Mis Fotos', path: '/member/photos', icon: Image },
  { name: 'Torneos', path: '/member/tournaments', icon: Trophy },
  { name: 'Eventos', path: '/member/events', icon: Calendar },
];

function MemberLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifsRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/member/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch {
      // notifications are non-critical
    }
  };

  const handleOpenNotifs = async () => {
    setShowNotifs(prev => !prev);
    if (!showNotifs && unreadCount > 0) {
      try {
        await axios.put('/member/notifications/read-all');
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch { /* ignore */ }
    }
  };

  const isActive = (path) =>
    path === '/member' ? location.pathname === path : location.pathname.startsWith(path);

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
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 flex-shrink-0">
              <img src={logo} alt="Pelícanos" className="h-7 w-auto" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm uppercase tracking-wide leading-tight">
                Pelícanos Vóley
              </p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Miembro</p>
            </div>
          </div>
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
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden sm:block text-xs font-bold uppercase tracking-widest text-slate-400">
                Portal del Miembro
              </span>
              {/* Notification Bell */}
              <div className="relative" ref={notifsRef}>
                <button
                  onClick={handleOpenNotifs}
                  className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  aria-label="Notificaciones"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-slate-200 shadow-xl z-50 max-h-96 flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <p className="font-display font-bold uppercase text-slate-900 text-sm">Notificaciones</p>
                      <button onClick={() => setShowNotifs(false)} className="p-1 hover:bg-slate-100 transition-colors">
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sin notificaciones</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n._id} className={`px-4 py-3 border-b border-slate-50 ${!n.read ? 'bg-primary-50' : ''}`}>
                            <p className="text-sm text-slate-700">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
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

export default MemberLayout;
