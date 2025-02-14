import React, { useState } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import LoadingScreen from './common/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const [open, setOpen] = useState(true);
  const { currentUser, loading } = useAuth();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Navbar open={open} toggleDrawer={toggleDrawer} />
      <Sidebar open={open} toggleDrawer={toggleDrawer} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          backgroundColor: 'background.default',
          p: 3,
          pt: 8
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Layout;
