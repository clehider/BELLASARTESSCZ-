import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    estudiantes: 0,
    profesores: 0,
    materias: 0,
    calificaciones: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener conteos de cada colección
        const estudiantesSnapshot = await getDocs(collection(db, 'estudiantes'));
        const profesoresSnapshot = await getDocs(collection(db, 'profesores'));
        const materiasSnapshot = await getDocs(collection(db, 'materias'));
        const calificacionesSnapshot = await getDocs(collection(db, 'calificaciones'));

        setStats({
          estudiantes: estudiantesSnapshot.size,
          profesores: profesoresSnapshot.size,
          materias: materiasSnapshot.size,
          calificaciones: calificacionesSnapshot.size
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Error al cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      </Container>
    );
  }

  const cards = [
    { title: 'Total Estudiantes', value: stats.estudiantes, icon: <PeopleIcon sx={{ fontSize: 40 }} />, color: '#1976d2' },
    { title: 'Total Profesores', value: stats.profesores, icon: <PersonIcon sx={{ fontSize: 40 }} />, color: '#2e7d32' },
    { title: 'Total Materias', value: stats.materias, icon: <SchoolIcon sx={{ fontSize: 40 }} />, color: '#ed6c02' },
    { title: 'Total Calificaciones', value: stats.calificaciones, icon: <GradeIcon sx={{ fontSize: 40 }} />, color: '#9c27b0' }
  ];

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Administrativo
        </Typography>

        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Box sx={{ color: card.color }}>
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography variant="h4" component="div">
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
