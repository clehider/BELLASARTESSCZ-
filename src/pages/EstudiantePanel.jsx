import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Grade as GradeIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const EstudiantePanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [materias, setMaterias] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [progreso, setProgreso] = useState({
    materiasAprobadas: 0,
    promedioGeneral: 0,
    asistenciaPromedio: 0,
    modulosCompletados: 0
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      // Obtener matrículas del estudiante
      const matriculasQuery = query(
        collection(db, 'matriculas'),
        where('estudianteId', '==', currentUser.uid)
      );
      const matriculasSnapshot = await getDocs(matriculasQuery);
      
      // Obtener materias matriculadas
      const materiasIds = matriculasSnapshot.docs.map(doc => doc.data().materiaId);
      const materiasData = [];
      for (const materiaId of materiasIds) {
        const materiaDoc = await getDocs(query(collection(db, 'materias'), where('id', '==', materiaId)));
        if (materiaDoc.docs.length > 0) {
          materiasData.push({
            id: materiaDoc.docs[0].id,
            ...materiaDoc.docs[0].data()
          });
        }
      }
      setMaterias(materiasData);

      // Obtener calificaciones
      const calificacionesQuery = query(
        collection(db, 'calificaciones'),
        where('estudianteId', '==', currentUser.uid)
      );
      const calificacionesSnapshot = await getDocs(calificacionesQuery);
      const calificacionesData = calificacionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCalificaciones(calificacionesData);

      // Obtener asistencias
      const asistenciasQuery = query(
        collection(db, 'asistencias'),
        where('estudianteId', '==', currentUser.uid)
      );
      const asistenciasSnapshot = await getDocs(asistenciasQuery);
      const asistenciasData = asistenciasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAsistencias(asistenciasData);

      // Calcular estadísticas
      const materiasAprobadas = calificacionesData.filter(c => c.calificacion >= 60).length;
      const promedioGeneral = calificacionesData.length > 0 
        ? calificacionesData.reduce((acc, curr) => acc + curr.calificacion, 0) / calificacionesData.length 
        : 0;
      const asistenciaPromedio = asistenciasData.length > 0
        ? (asistenciasData.filter(a => a.estado).length / asistenciasData.length) * 100
        : 0;

      setProgreso({
        materiasAprobadas,
        promedioGeneral,
        asistenciaPromedio,
        modulosCompletados: Math.floor(materiasAprobadas / 3) // Asumiendo que cada módulo tiene 3 materias
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Materias Aprobadas
              </Typography>
              <Typography variant="h4">
                {progreso.materiasAprobadas}/{materias.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Promedio General
              </Typography>
              <Typography variant="h4">
                {progreso.promedioGeneral.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Asistencia
              </Typography>
              <Typography variant="h4">
                {progreso.asistenciaPromedio.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Módulos Completados
              </Typography>
              <Typography variant="h4">
                {progreso.modulosCompletados}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs y contenido */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Materias" />
            <Tab label="Calificaciones" />
            <Tab label="Asistencias" />
          </Tabs>
        </Box>

        {/* Panel de Materias */}
        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Materia</TableCell>
                  <TableCell>Módulo</TableCell>
                  <TableCell>Profesor</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materias.map((materia) => (
                  <TableRow key={materia.id}>
                    <TableCell>{materia.nombre}</TableCell>
                    <TableCell>{materia.modulo}</TableCell>
                    <TableCell>{materia.profesorNombre}</TableCell>
                    <TableCell>
                      <Chip
                        label={materia.estado || 'En curso'}
                        color={materia.estado === 'Aprobado' ? 'success' : 'primary'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Panel de Calificaciones */}
        {tabValue === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Materia</TableCell>
                  <TableCell>Calificación</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calificaciones.map((calificacion) => (
                  <TableRow key={calificacion.id}>
                    <TableCell>
                      {materias.find(m => m.id === calificacion.materiaId)?.nombre || 'N/A'}
                    </TableCell>
                    <TableCell>{calificacion.calificacion}</TableCell>
                    <TableCell>{new Date(calificacion.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{calificacion.observaciones}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Panel de Asistencias */}
        {tabValue === 2 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Materia</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asistencias.map((asistencia) => (
                  <TableRow key={asistencia.id}>
                    <TableCell>
                      {materias.find(m => m.id === asistencia.materiaId)?.nombre || 'N/A'}
                    </TableCell>
                    <TableCell>{new Date(asistencia.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={asistencia.estado ? 'Presente' : 'Ausente'}
                        color={asistencia.estado ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>{asistencia.observaciones}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default EstudiantePanel;
