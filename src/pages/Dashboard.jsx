import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/dashboard/StatsCard';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';

const Dashboard = () => {
  const { currentUser, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      estudiantes: 0,
      materias: 0,
      modulos: 0,
      asistencia: 0,
      aprobados: 0,
      pendientes: 0
    },
    actividadReciente: [],
    rendimiento: [],
    proximas: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let data = { ...dashboardData };

        switch(userRole) {
          case 'admin':
            // Estadísticas generales
            const estudiantesSnap = await getDocs(collection(db, 'estudiantes'));
            const materiasSnap = await getDocs(collection(db, 'materias'));
            const modulosSnap = await getDocs(collection(db, 'modulos'));
            
            data.stats = {
              estudiantes: estudiantesSnap.size,
              materias: materiasSnap.size,
              modulos: modulosSnap.size,
              asistencia: 85, // Promedio general
              aprobados: 75, // Porcentaje general
              pendientes: 25
            };
            break;

          case 'profesor':
            // Obtener materias asignadas al profesor
            const materiasProfesor = await getDocs(
              query(collection(db, 'materias'), 
              where('profesorId', '==', currentUser.uid))
            );
            
            // Obtener estudiantes en sus materias
            const estudiantesProfesor = new Set();
            for (const materia of materiasProfesor.docs) {
              const matriculas = await getDocs(
                query(collection(db, 'matriculas'), 
                where('materiaId', '==', materia.id))
              );
              matriculas.forEach(m => estudiantesProfesor.add(m.data().estudianteId));
            }

            data.stats = {
              estudiantes: estudiantesProfesor.size,
              materias: materiasProfesor.size,
              modulos: await getModulosCount(materiasProfesor.docs.map(d => d.id)),
              asistencia: await getPromedioAsistencia(materiasProfesor.docs.map(d => d.id)),
              aprobados: await getPromedioAprobados(materiasProfesor.docs.map(d => d.id)),
              pendientes: await getPromedioPendientes(materiasProfesor.docs.map(d => d.id))
            };
            break;

          case 'estudiante':
            // Obtener matrículas del estudiante
            const matriculasEstudiante = await getDocs(
              query(collection(db, 'matriculas'), 
              where('estudianteId', '==', currentUser.uid))
            );
            
            data.stats = {
              materias: matriculasEstudiante.size,
              modulos: await getModulosCompletados(currentUser.uid),
              asistencia: await getAsistenciaEstudiante(currentUser.uid),
              aprobados: await getMateriasAprobadas(currentUser.uid),
              pendientes: await getMateriasPendientes(currentUser.uid)
            };
            break;
        }

        // Obtener actividad reciente
        data.actividadReciente = await getActividadReciente(userRole, currentUser.uid);
        
        // Obtener datos de rendimiento
        data.rendimiento = await getRendimientoData(userRole, currentUser.uid);

        // Obtener próximas actividades
        data.proximas = await getProximasActividades(userRole, currentUser.uid);

        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, userRole]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Estadísticas principales */}
        <Grid item xs={12} md={4}>
          <StatsCard
            title={userRole === 'estudiante' ? "Materias Inscritas" : "Estudiantes"}
            value={userRole === 'estudiante' ? dashboardData.stats.materias : dashboardData.stats.estudiantes}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Materias Activas"
            value={dashboardData.stats.materias}
            icon={<SchoolIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title={userRole === 'estudiante' ? "Módulos Completados" : "Módulos Activos"}
            value={dashboardData.stats.modulos}
            icon={<AssignmentIcon />}
            color="#ed6c02"
          />
        </Grid>

        {/* Gráfico de rendimiento */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 340 }}>
            <Typography variant="h6" gutterBottom>
              Rendimiento Académico
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveLine
                data={dashboardData.rendimiento}
                margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, max: 100 }}
                curve="monotoneX"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                enableArea={true}
                areaOpacity={0.15}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Actividad reciente */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 340 }}>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente
            </Typography>
            <List>
              {dashboardData.actividadReciente.map((actividad, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={actividad.descripcion}
                      secondary={new Date(actividad.fecha).toLocaleDateString()}
                    />
                  </ListItem>
                  {index < dashboardData.actividadReciente.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Estadísticas adicionales */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Typography variant="h6" gutterBottom>
              Estado de Materias
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsivePie
                data={[
                  {
                    id: 'aprobadas',
                    label: 'Aprobadas',
                    value: dashboardData.stats.aprobados,
                    color: '#2e7d32'
                  },
                  {
                    id: 'pendientes',
                    label: 'Pendientes',
                    value: dashboardData.stats.pendientes,
                    color: '#ed6c02'
                  }
                ]}
                margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ datum: 'data.color' }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Próximas actividades */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Typography variant="h6" gutterBottom>
              Próximas Actividades
            </Typography>
            <List>
              {dashboardData.proximas.map((actividad, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={actividad.titulo}
                    secondary={`${actividad.fecha} - ${actividad.materia}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

// Funciones auxiliares para obtener datos
const getModulosCount = async (materiasIds) => {
  // Implementar lógica para contar módulos
  return 0;
};

const getPromedioAsistencia = async (materiasIds) => {
  // Implementar lógica para calcular promedio de asistencia
  return 0;
};

const getPromedioAprobados = async (materiasIds) => {
  // Implementar lógica para calcular promedio de aprobados
  return 0;
};

const getPromedioPendientes = async (materiasIds) => {
  // Implementar lógica para calcular promedio de pendientes
  return 0;
};

const getModulosCompletados = async (estudianteId) => {
  // Implementar lógica para contar módulos completados
  return 0;
};

const getAsistenciaEstudiante = async (estudianteId) => {
  // Implementar lógica para calcular asistencia del estudiante
  return 0;
};

const getMateriasAprobadas = async (estudianteId) => {
  // Implementar lógica para contar materias aprobadas
  return 0;
};

const getMateriasPendientes = async (estudianteId) => {
  // Implementar lógica para contar materias pendientes
  return 0;
};

const getActividadReciente = async (userRole, userId) => {
  // Implementar lógica para obtener actividad reciente
  return [];
};

const getRendimientoData = async (userRole, userId) => {
  // Implementar lógica para obtener datos de rendimiento
  return [];
};

const getProximasActividades = async (userRole, userId) => {
  // Implementar lógica para obtener próximas actividades
  return [];
};

export default Dashboard;
