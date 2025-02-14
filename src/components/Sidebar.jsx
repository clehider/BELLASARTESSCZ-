import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Cursos', icon: <SchoolIcon />, path: '/courses' },
  { text: 'Estudiantes', icon: <PeopleIcon />, path: '/students' },
  { text: 'Finanzas', icon: <MoneyIcon />, path: '/finances' },
  { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ open }) => {
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          ...(!open && {
            width: theme => theme.spacing(7),
            overflowX: 'hidden',
          }),
        },
      }}
      open={open}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
