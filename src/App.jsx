import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Materias from './pages/Materias';
import Estudiantes from './pages/Estudiantes';
import Profesores from './pages/Profesores';
import Calificaciones from './pages/Calificaciones';
import NavBar from './components/NavBar';
import { setupUsers } from './utils/setupUsers';
import { setupModules } from './utils/setupModules';

function App() {
  useEffect(() => {
    // Configurar usuarios y módulos al iniciar la app
    setupUsers();
    setupModules();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex' }}>
          <NavBar />
          <main style={{ flexGrow: 1, marginTop: '64px', padding: '20px' }}>
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
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/materias"
                element={
                  <PrivateRoute>
                    <Materias />
                  </PrivateRoute>
                }
              />
              <Route
                path="/estudiantes"
                element={
                  <PrivateRoute>
                    <Estudiantes />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profesores"
                element={
                  <PrivateRoute>
                    <Profesores />
                  </PrivateRoute>
                }
              />
              <Route
                path="/calificaciones"
                element={
                  <PrivateRoute>
                    <Calificaciones />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
