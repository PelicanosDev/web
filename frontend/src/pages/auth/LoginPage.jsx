import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/images/Logo.png';
import banner from '@/assets/images/Banner.jpeg';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Banner de fondo */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
        }}
      ></div>
      
      {/* Degradado con los colores del home */}
      <div className="absolute inset-0 bg-gradient-to-br from-ocean-500 via-ocean-500/80 to-primary-500/90"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center hover:opacity-90 transition-opacity">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <img src={logo} alt="Pelícanos Voley Club" className="h-20 w-auto" />
            </div>
          </Link>
        </div>

        <div className="card">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Bienvenido de Nuevo
          </h1>
          <p className="text-gray-600 mb-8">
            Inicia sesión para acceder a tu cuenta
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input pl-10"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600">
            <Link to="/" className="text-primary-500 hover:text-primary-600 font-medium">
              ← Volver al Inicio
            </Link>
          </div>
        </div>

        <div className="text-center text-white mt-8">
          <p className="text-sm mb-2">Credenciales de demostración:</p>
          <p className="text-xs opacity-90">Admin: admin@pelicanos.co / Admin123!</p>
          <p className="text-xs opacity-90">Miembro: member@pelicanos.co / Member123!</p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
