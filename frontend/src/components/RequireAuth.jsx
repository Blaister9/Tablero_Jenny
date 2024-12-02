// components/RequireAuth.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children, fallback = null }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    const handleLoginRedirect = () => {
      // Guardamos la ubicación actual para redirigir después del login
      navigate('/login', { 
        state: { from: location }
      });
    };

    return (
      <button
        onClick={handleLoginRedirect}
        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
      >
        Iniciar sesión para crear tarea
      </button>
    );
  }

  return children;
};

export default RequireAuth;