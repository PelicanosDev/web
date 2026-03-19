import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Trophy, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/images/Logo.png';
import banner from '@/assets/images/Banner.jpeg';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === 'admin' || user.role === 'coach') {
        navigate('/admin');
      } else if (user.role === 'member') {
        navigate('/member');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales inválidas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background image */}
        <img
          src={banner}
          alt="Canchas de vóley playa Pelícanos"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-slate-900/70" />

        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al sitio
          </Link>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-primary-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-8">
              Plataforma de Gestión
            </span>

            <h1
              className="font-display font-black uppercase text-white leading-none mb-6"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: '0.93' }}
            >
              <span className="block">Bienvenido</span>
              <span className="block text-primary-400">de vuelta</span>
            </h1>

            <p className="text-slate-300 text-lg max-w-sm leading-relaxed mb-10">
              Gestiona tu rendimiento, participa en torneos y forma parte de la comunidad más activa de Manizales.
            </p>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-px bg-slate-700/40">
              {[
                { icon: Users, value: '100+', label: 'Miembros' },
                { icon: Trophy, value: '30+', label: 'Torneos / Año' },
                { icon: Calendar, value: '10', label: 'Años' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-slate-900/60 px-4 py-5 text-center">
                  <Icon className="w-5 h-5 text-primary-400 mx-auto mb-2" />
                  <div className="font-display font-black text-2xl text-white leading-none">{value}</div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Logo footer */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Pelícanos Voley Club" className="h-10 w-auto" />
            <div>
              <p className="font-display font-bold text-white text-sm uppercase tracking-wide">Pelícanos Vóley Club</p>
              <p className="text-slate-500 text-xs">Manizales, Caldas</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-bold uppercase tracking-widest mb-6">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
            <div className="block">
              <img src={logo} alt="Pelícanos Voley Club" className="h-14 w-auto mx-auto" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-10">
            <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-4 py-1.5 mb-6">
              Acceso al sistema
            </span>
            <h2
              className="font-display font-black uppercase text-slate-900 leading-none mb-3"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
            >
              Iniciar <span className="text-primary-500">Sesión</span>
            </h2>
            <p className="text-slate-500 text-base">
              Ingresa tus credenciales para acceder a tu cuenta.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3" role="alert">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
              >
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
              >
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-8 py-4 hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              ¿Necesitas ayuda?{' '}
              <Link
                to="/contact"
                className="text-primary-600 font-bold hover:text-primary-700 transition-colors"
              >
                Contáctanos
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
