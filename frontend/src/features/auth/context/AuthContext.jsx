import { createContext, useContext, useState, useEffect } from 'react';
import axios from '@/api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsTreatment, setNeedsTreatment] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setNeedsTreatment(parsed.tratamiento === false);
        setLoading(false);

        try {
          const response = await axios.get('/auth/me');
          const freshUser = response.data.data;
          setUser(freshUser);
          setNeedsTreatment(freshUser.tratamiento === false);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
            setNeedsTreatment(false);
          }
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setNeedsTreatment(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setNeedsTreatment(false);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post('/auth/login', { email, password });
    const { token, refreshToken, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    setUser(user);
    setNeedsTreatment(user.tratamiento === false);

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
      setNeedsTreatment(false);
    }
  };

  const acceptTreatment = async () => {
    try {
      const response = await axios.put('/auth/accept-treatment');
      const updatedUser = response.data.data;
      setUser(updatedUser);
      setNeedsTreatment(false);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error accepting treatment:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    needsTreatment,
    acceptTreatment,
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
