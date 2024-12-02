import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {        
        api.defaults.headers.common['Authorization'] = `JWT ${token}`;
        const response = await api.get('/users/me/');
        setUser(response.data);
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/jwt/create/', { username, password });
      const token = response.data.access;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `JWT ${token}`;
      await checkAuth();
    } catch (error) {
      console.error('Error durante el login:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Funciones de permisos
  const isJenny = () => {
    return user?.username === 'Jenny' || user?.username === 'admin_jenny';
  };

  const canCreateTask = () => {
    return isJenny();
  };

  const canEditTask = (task) => {
    if (!user) return false;
    if (isJenny()) return true;
    return false;
  };

  const canEditObservations = (task) => {
    return true;
  };

  const canDeleteTask = () => {
    return isJenny();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      isJenny,
      canCreateTask,
      canEditTask,
      canEditObservations,
      canDeleteTask
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);