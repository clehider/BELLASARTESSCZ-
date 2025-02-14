import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ModulosPage from './components/ModulosPage';
import MateriasPage from './components/MateriasPage';
import EstudiantesPage from './components/EstudiantesPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/modulos"
              element={
                <PrivateRoute>
                  <Layout>
                    <ModulosPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/materias"
              element={
                <PrivateRoute>
                  <Layout>
                    <MateriasPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/estudiantes"
              element={
                <PrivateRoute>
                  <Layout>
                    <EstudiantesPage />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
