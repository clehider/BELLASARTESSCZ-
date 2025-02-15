import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import StudentLayout from '../layouts/StudentLayout';

// Páginas comunes
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import Home from '../pages/Home';

// Páginas de Administrador
import Estudiantes from '../pages/Estudiantes';
import Profesores from '../pages/Profesores';
import Materias from '../pages/Materias';
import Calificaciones from '../pages/Calificaciones';

// Páginas de Estudiante
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentMaterias from '../pages/student/StudentMaterias';
import StudentCalificaciones from '../pages/student/StudentCalificaciones';

const PrivateRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />

        {/* Rutas de Administrador */}
        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="estudiantes" element={<Estudiantes />} />
          <Route path="profesores" element={<Profesores />} />
          <Route path="materias" element={<Materias />} />
          <Route path="calificaciones" element={<Calificaciones />} />
          <Route index element={<Navigate to="estudiantes" replace />} />
        </Route>

        {/* Rutas de Estudiante */}
        <Route
          path="/student"
          element={
            <PrivateRoute requiredRole="student">
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="materias" element={<StudentMaterias />} />
          <Route path="calificaciones" element={<StudentCalificaciones />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
