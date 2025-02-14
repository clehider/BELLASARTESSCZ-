import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProfesorPanel from './pages/ProfesorPanel';
import NavBar from './components/NavBar';
import { setupUsers } from './utils/setupUsers';

function App() {
  useEffect(() => {
    setupUsers();
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
                path="/profesor"
                element={
                  <PrivateRoute>
                    <ProfesorPanel />
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
