import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  School as SchoolIcon,
  Info as InfoIcon,
  Grade as GradeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

const StudentMaterias = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [materias, setMaterias] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchMaterias = async () => {
      if (!currentUser) return;

      try {
        // Primero obtener el ID del estudiante
        const estudiantesRef = collection(db, 'estudiantes');
        const estudianteQuery = query(estudiantesRef, where('email', '==', currentUser.email));
        const estudianteSnapshot = await getDocs(estudianteQuery);
        
        if (!estudianteSnapshot.empty) {
          const studentId = estudianteSnapshot.docs[0].id;

          // Obtener calificaciones del estudiante
          const calificacionesRef = collection(db, 'calificaciones');
          const calificacionesQuery = query(calificacionesRef, where('estudiante_id', '==', studentId));
          const calificacionesSnapshot = await getDocs(calificacionesQuery);
          
          const calificacionesData = [];
          const materiasIds = new Set();

          calificacionesSnapshot.forEach(doc => {
            const calificacion = { id: doc.id, ...doc.data() };
            materiasIds.add(calificacion.materia_id);
            calificacionesData.push(calificacion);
          });

          setCalificaciones(calificacionesData);

          // Obtener detalles de las materias
          const materiasRef = collection(db, 'materias');
          const materiasSnapshot = await getDocs(materiasRef);
          const materiasData = materiasSnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(materia => materiasIds.has(materia.id));

          setMaterias(materiasData);
        }
      } catch (error) {
        console.error('Error fetching materias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, [currentUser]);

  const calcularPromedio = (materiaId) => {
    const calificacionesMateria = calificaciones.filter(c => c.materia_id === materiaId);
    if (calificacionesMateria.length === 0) return 'N/A';
    const suma = calificacionesMateria.reduce((acc, cal) => acc + cal.calificacion, 0);
    return (suma / calificacionesMateria.length).toFixed(2);
  };

  const handleOpenDialog = (materia) => {
    setSelectedMateria(materia);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMateria(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Materias
        </Typography>

        {materias.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No tienes materias registradas</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {materias.map((materia) => {
              const promedio = calcularPromedio(materia.id);
              const calificacionesMateria = calificaciones.filter(
                c => c.materia_id === materia.id
              );

              return (
                <Grid item xs={12} sm={6} md={4} key={materia.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {materia.nombre}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Código: {materia.codigo}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {materia.descripcion}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          icon={<SchoolIcon />}
                          label={`Semestre ${materia.semestre}`}
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          icon={<InfoIcon />}
                          label={`Créditos: ${materia.creditos}`}
                          color="secondary"
                          size="small"
                        />
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={`Promedio: ${promedio}`}
                          color={promedio >= 51 ? "success" : "error"}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        color="primary"
                        startIcon={<InfoIcon />}
                        onClick={() => handleOpenDialog(materia)}
                      >
                        Ver Detalles
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Diálogo de detalles de la materia */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedMateria && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedMateria.nombre}
                </Typography>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleCloseDialog}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Información de la Materia
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Código:</strong> {selectedMateria.codigo}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Créditos:</strong> {selectedMateria.creditos}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Semestre:</strong> {selectedMateria.semestre}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Descripción:</strong> {selectedMateria.descripcion}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  Calificaciones
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Periodo</TableCell>
                        <TableCell>Calificación</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {calificaciones
                        .filter(c => c.materia_id === selectedMateria.id)
                        .map((calificacion, index) => (
                          <TableRow key={index}>
                            <TableCell>{calificacion.periodo}</TableCell>
                            <TableCell>{calificacion.calificacion}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={calificacion.calificacion >= 51 ? "Aprobado" : "Reprobado"}
                                color={calificacion.calificacion >= 51 ? "success" : "error"}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog} color="primary">
                  Cerrar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default StudentMaterias;
