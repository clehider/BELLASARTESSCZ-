import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import Login from './pages/Login';
import Estudiantes from './pages/Estudiantes';
import Profesores from './pages/Profesores';
import Materias from './pages/Materias';
import Calificaciones from './pages/Calificaciones';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentMaterias from './pages/student/StudentMaterias';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/admin',
    element: <PrivateRoute requiredRole="admin"><AdminLayout /></PrivateRoute>,
    children: [
      {
        path: 'estudiantes',
        element: <Estudiantes />
      },
      {
        path: 'profesores',
        element: <Profesores />
      },
      {
        path: 'materias',
        element: <Materias />
      },
      {
        path: 'calificaciones',
        element: <Calificaciones />
      }
    ]
  },
  {
    path: '/student',
    element: <PrivateRoute requiredRole="student"><StudentLayout /></PrivateRoute>,
    children: [
      {
        path: 'dashboard',
        element: <StudentDashboard />
      },
      {
        path: 'materias',
        element: <StudentMaterias />
      }
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
