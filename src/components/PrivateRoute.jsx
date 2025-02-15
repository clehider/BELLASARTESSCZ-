import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirigir a la ruta apropiada según el rol
    if (userRole === 'admin') {
      return <Navigate to="/admin/estudiantes" />;
    } else if (userRole === 'student') {
      return <Navigate to="/student/dashboard" />;
    } else {
      return <Navigate to="/login" />;
    }
  }

  return children;
};

export default PrivateRoute;
