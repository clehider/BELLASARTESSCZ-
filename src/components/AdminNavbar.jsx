import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    { text: 'Gestión de Maestros', icon: <SchoolIcon />, path: '/admin/teachers' },
    { text: 'Gestión de Alumnos', icon: <PeopleIcon />, path: '/admin/students' },
    { text: 'Caja Chica', icon: <MoneyIcon />, path: '/admin/cash-register' },
    { text: 'Reportes', icon: <AssessmentIcon />, path: '/admin/reports' },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenu}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {menuItems.map((item) => (
            <MenuItem 
              key={item.path}
              onClick={() => {
                handleClose();
                navigate(item.path);
              }}
            >
              {item.icon}
              <Typography sx={{ ml: 1 }}>{item.text}</Typography>
            </MenuItem>
          ))}
        </Menu>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Panel de Administración
        </Typography>
        <Button 
          color="inherit" 
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
        >
          Cerrar Sesión
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;
