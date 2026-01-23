import { createContext, useContext, useState, useEffect } from 'react';
import axios from '@/api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token) {
        // Intentar verificar con el servidor
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data.data);
          // Actualizar usuario en localStorage
          localStorage.setItem('user', JSON.stringify(response.data.data));
        } catch (error) {
          // Si falla la verificación pero hay usuario guardado, usarlo temporalmente
          if (storedUser && error.response?.status !== 401) {
            setUser(JSON.parse(storedUser));
          } else {
            // Token inválido, limpiar todo
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } else if (storedUser) {
        // No hay token pero hay usuario guardado, limpiar
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post('/auth/login', { email, password });
    const { token, refreshToken, user } = response.data;
    
    // Guardar en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', user.id);
    
    // Actualizar estado
    setUser(user);
    
    // Configurar header de axios para futuras peticiones
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return user;
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isMember: user?.role === 'member',
    isCoach: user?.role === 'coach',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
