import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  LibraryBooks as LibraryBooksIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { styled } from '@mui/material/styles';

// Estilos personalizados
const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const StatsCard = ({ title, value, icon: Icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Grid container spacing={3} alignItems="center">
        <Grid item>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            <Icon />
          </Avatar>
        </Grid>
        <Grid item xs>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    modulos: [],
    materias: [],
    estudiantes: []
  });
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const collections = ['modulos', 'materias', 'estudiantes'];
        const fetchedData = {};

        for (const collectionName of collections) {
          const querySnapshot = await getDocs(collection(db, collectionName));
          fetchedData[collectionName] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }

        setData(fetchedData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const menuItems = [
    { text: 'Dashboard', icon: DashboardIcon, path: '/' },
    { text: 'Módulos', icon: SchoolIcon, path: '/modulos' },
    { text: 'Materias', icon: LibraryBooksIcon, path: '/materias' },
    { text: 'Estudiantes', icon: PeopleIcon, path: '/estudiantes' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Instituto de Bellas Artes SCZ
          </Typography>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleMenuClick}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {currentUser?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Perfil</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Configuración</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cerrar Sesión</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Main open={drawerOpen}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Módulos"
                value={data.modulos.length}
                icon={SchoolIcon}
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Materias"
                value={data.materias.length}
                icon={LibraryBooksIcon}
                color="#2e7d32"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Estudiantes"
                value={data.estudiantes.length}
                icon={PeopleIcon}
                color="#ed6c02"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                title="Usuarios Activos"
                value={data.estudiantes.filter(e => e.estado === 'activo').length}
                icon={PersonIcon}
                color="#9c27b0"
              />
            </Grid>

            {/* Sección de Módulos */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Módulos Activos
                </Typography>
                <Grid container spacing={2}>
                  {data.modulos.map((modulo) => (
                    <Grid item xs={12} sm={6} md={4} key={modulo.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{modulo.nombre}</Typography>
                          <Typography color="textSecondary">
                            {modulo.descripcion}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Sección de Materias */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Materias Recientes
                </Typography>
                <Grid container spacing={2}>
                  {data.materias.map((materia) => (
                    <Grid item xs={12} sm={6} md={4} key={materia.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{materia.nombre}</Typography>
                          <Typography color="textSecondary">
                            {materia.descripcion}
                          </Typography>
                          <Typography variant="body2">
                            Créditos: {materia.creditos}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Main>
    </Box>
  );
};

export default Dashboard;
