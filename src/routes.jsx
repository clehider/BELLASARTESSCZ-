import React from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export const publicRoutes = [
  {
    path: '/login',
    element: <Login />
  }
];

export const privateRoutes = [
  {
    path: '/',
    element: <Dashboard />
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
];
