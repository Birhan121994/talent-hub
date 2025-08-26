'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app load
    const savedToken = Cookies.get('accessToken');
    const savedUser = Cookies.get('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', credentials);
      const { access, refresh, user } = response.data;
      
      // Set token and user
      setToken(access);
      setUser(user);
      
      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Save to cookies
      Cookies.set('accessToken', access, { expires: 7 });
      Cookies.set('refreshToken', refresh, { expires: 7 });
      Cookies.set('user', JSON.stringify(user), { expires: 7 });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          "Unable to log in with provided credentials.";
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', userData);
      const { access, refresh, user } = response.data;
      
      // Set token and user
      setToken(access);
      setUser(user);
      
      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Save to cookies
      Cookies.set('accessToken', access, { expires: 7 });
      Cookies.set('refreshToken', refresh, { expires: 7 });
      Cookies.set('user', JSON.stringify(user), { expires: 7 });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data || 
                          "Registration failed. Please try again.";
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    // Clear state first
    setUser(null);
    setToken(null);
    
    // Remove from axios headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear cookies
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
    
    toast.info('Logged out successfully');
  };

  const refreshUser = async () => {
  const savedToken = Cookies.get('accessToken');
  if (!savedToken) return;

  try {
    const response = await axios.get('http://localhost:8000/api/auth/user/', {
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    });

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