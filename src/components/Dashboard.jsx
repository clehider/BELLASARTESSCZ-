import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  LibraryBooks as LibraryBooksIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const [stats, setStats] = useState({
    estudiantes: [],
    modulos: [],
    materias: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log("Iniciando fetchData");
      setLoading(true);
      const [estudiantesSnap, modulosSnap, materiasSnap] = await Promise.all([
        getDocs(collection(db, 'estudiantes')),
        getDocs(collection(db, 'modulos')),
        getDocs(collection(db, 'materias'))
      ]);

      console.log("Datos obtenidos:", {
        estudiantes: estudiantesSnap.docs.length,
        modulos: modulosSnap.docs.length,
        materias: materiasSnap.docs.length
      });

      setStats({
        estudiantes: estudiantesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        modulos: modulosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        materias: materiasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const getEstudiantesPorModulo = () => {
    const estudiantesPorModulo = stats.modulos.map(modulo => ({
      id: modulo.nombre,
      label: modulo.nombre,
      value: stats.estudiantes.filter(e => e.moduloId === modulo.id).length
    }));
    return estudiantesPorModulo;
  };

  const getMateriasPorModulo = () => {
    return stats.modulos.map(modulo => ({
      modulo: modulo.nombre,
      cantidad: stats.materias.filter(m => m.moduloId === modulo.id).length
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Reporte Estadístico - Instituto Bellas Artes SCZ', 105, 20, { align: 'center' });
    
    // Fecha
    doc.setFontSize(12);
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 30, { align: 'center' });

    // Estadísticas Generales
    const tableData = [
      ['Categoría', 'Total', 'Activos'],
      ['Estudiantes', stats.estudiantes.length, stats.estudiantes.filter(e => e.estado === 'activo').length],
      ['Módulos', stats.modulos.length, stats.modulos.filter(m => m.estado === 'activo').length],
      ['Materias', stats.materias.length, stats.materias.filter(m => m.estado === 'activo').length]
    ];

    doc.autoTable({
      startY: 40,
      head: [tableData[0]],
      body: tableData.slice(1),
    });

    doc.save('reporte-estadistico.pdf');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Tarjetas de estadísticas */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Estudiantes
                  </Typography>
                  <Typography variant="h4">
                    {stats.estudiantes.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Módulos
                  </Typography>
                  <Typography variant="h4">
                    {stats.modulos.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Materias
                  </Typography>
                  <Typography variant="h4">
                    {stats.materias.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <LibraryBooksIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráficos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Estudiantes por Módulo
            </Typography>
            <Box height={300}>
              <ResponsivePie
                data={getEstudiantesPorModulo()}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                colors={{ scheme: 'nivo' }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                enableArcLinkLabels={true}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLabelsSkipAngle={10}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Materias por Módulo
            </Typography>
            <Box height={300}>
              <ResponsiveBar
                data={getMateriasPorModulo()}
                keys={['cantidad']}
                indexBy="modulo"
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                colors={{ scheme: 'nivo' }}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                labelSkipWidth={12}
                labelSkipHeight={12}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Botón de Descarga */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={generatePDF}
            >
              Descargar Reporte
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
