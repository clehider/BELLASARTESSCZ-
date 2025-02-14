import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  LibraryBooks as LibraryBooksIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const DashboardCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    estudiantes: 0,
    profesores: 0,
    materias: 0,
    calificaciones: 0
  });
  const { userRole } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const collections = ['estudiantes', 'profesores', 'materias', 'calificaciones'];
        const statsData = {};

        for (const col of collections) {
          const snapshot = await getDocs(collection(db, col));
          statsData[col] = snapshot.size;
        }

        setStats(statsData);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="textSecondary">
        Bienvenido al panel de control
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Estudiantes"
            value={stats.estudiantes}
            icon={<SchoolIcon sx={{ color: '#1976d2' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Profesores"
            value={stats.profesores}
            icon={<PersonIcon sx={{ color: '#388e3c' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Materias"
            value={stats.materias}
            icon={<LibraryBooksIcon sx={{ color: '#f57c00' }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Calificaciones"
            value={stats.calificaciones}
            icon={<AssignmentIcon sx={{ color: '#d32f2f' }} />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Más contenido del dashboard según el rol */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente
            </Typography>
            {/* Aquí puedes agregar una lista de actividades recientes */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Próximos Eventos
            </Typography>
            {/* Aquí puedes agregar una lista de próximos eventos */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
