'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import api from '@/lib/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = Cookies.get('accessToken');
    const savedUser = Cookies.get('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/api/auth/login/', credentials);
      const { access, refresh, user } = response.data;

      setToken(access);
      setUser(user);

      Cookies.set('accessToken', access, { expires: 7 });
      Cookies.set('refreshToken', refresh, { expires: 7 });
      Cookies.set('user', JSON.stringify(user), { expires: 7 });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Unable to log in with provided credentials.';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register/', userData);
      const { access, refresh, user } = response.data;

      setToken(access);
      setUser(user);

      Cookies.set('accessToken', access, { expires: 7 });
      Cookies.set('refreshToken', refresh, { expires: 7 });
      Cookies.set('user', JSON.stringify(user), { expires: 7 });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('user');

    toast.info('Logged out successfully');
  };

  const refreshUser = async () => {
    const savedToken = Cookies.get('accessToken');
    if (!savedToken) return;

    try {
      const response = await api.get('/api/auth/user/');
      const updatedUser = response.data;
      setUser(updatedUser);
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
    } catch (error) {
      console.error('Failed to refresh user', error);
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
