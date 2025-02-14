import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estudiantes from './pages/Estudiantes';
import Profesores from './pages/Profesores';
import Materias from './pages/Materias';
import Modulos from './pages/Modulos';
import ProfesorPanel from './pages/ProfesorPanel';
import EstudiantePanel from './pages/EstudiantePanel';
import Calificaciones from './pages/Calificaciones';
import Asistencia from './pages/Asistencia';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/estudiantes"
        element={
          <PrivateRoute allowedRoles={['admin', 'profesor']}>
            <Estudiantes />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/profesores"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <Profesores />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/materias"
        element={
          <PrivateRoute allowedRoles={['admin', 'profesor']}>
            <Materias />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/modulos"
        element={
          <PrivateRoute allowedRoles={['admin', 'profesor']}>
            <Modulos />
          </PrivateRoute>
        }
      />

      <Route
        path="/profesor"
        element={
          <PrivateRoute allowedRoles={['profesor']}>
            <ProfesorPanel />
          </PrivateRoute>
        }
      />

      <Route
        path="/estudiante"
        element={
          <PrivateRoute allowedRoles={['estudiante']}>
            <EstudiantePanel />
          </PrivateRoute>
        }
      />

      <Route
        path="/calificaciones"
        element={
          <PrivateRoute allowedRoles={['admin', 'profesor', 'estudiante']}>
            <Calificaciones />
          </PrivateRoute>
        }
      />

      <Route
        path="/asistencia"
        element={
          <PrivateRoute allowedRoles={['admin', 'profesor']}>
            <Asistencia />
          </PrivateRoute>
        }
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
