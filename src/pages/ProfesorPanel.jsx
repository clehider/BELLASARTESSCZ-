import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ProfesorPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({});
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const materiasQuery = query(
        collection(db, 'materias'),
        where('profesorId', '==', currentUser.uid)
      );
      const materiasSnapshot = await getDocs(materiasQuery);
      const materiasData = materiasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterias(materiasData);

      const estudiantesSet = new Set();
      for (const materia of materiasData) {
        const matriculasQuery = query(
          collection(db, 'matriculas'),
          where('materiaId', '==', materia.id)
        );
        const matriculasSnapshot = await getDocs(matriculasQuery);
        for (const matricula of matriculasSnapshot.docs) {
          const estudianteDoc = await getDocs(
            query(collection(db, 'estudiantes'),
            where('uid', '==', matricula.data().estudianteId))
          );
          if (estudianteDoc.docs.length > 0) {
            estudiantesSet.add({
              id: estudianteDoc.docs[0].id,
              ...estudianteDoc.docs[0].data()
            });
          }
        }
      }
      setEstudiantes(Array.from(estudiantesSet));

      const calificacionesQuery = query(
        collection(db, 'calificaciones'),
        where('profesorId', '==', currentUser.uid)
      );
      const calificacionesSnapshot = await getDocs(calificacionesQuery);
      const calificacionesData = calificacionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCalificaciones(calificacionesData);

      const asistenciasQuery = query(
        collection(db, 'asistencias'),
        where('profesorId', '==', currentUser.uid)
      );
      const asistenciasSnapshot = await getDocs(asistenciasQuery);
      const asistenciasData = asistenciasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAsistencias(asistenciasData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type, data = null) => {
    setDialogType(type);
    setFormData(data || {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const timestamp = new Date().toISOString();
      const commonData = {
        profesorId: currentUser.uid,
        fecha: timestamp,
        ...formData
      };

      switch (dialogType) {
        case 'calificacion':
          if (formData.id) {
            await updateDoc(doc(db, 'calificaciones', formData.id), commonData);
          } else {
            await addDoc(collection(db, 'calificaciones'), commonData);
          }
          break;

        case 'asistencia':
          if (formData.id) {
            await updateDoc(doc(db, 'asistencias', formData.id), commonData);
          } else {
            await addDoc(collection(db, 'asistencias'), commonData);
          }
          break;
      }
      
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleDelete = async (collectionName, id) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      fetchData();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const generateReport = (type) => {
    const doc = new jsPDF();
    
    switch(type) {
      case 'calificaciones':
        doc.text('Reporte de Calificaciones', 20, 10);
        doc.autoTable({
          head: [['Estudiante', 'Materia', 'Calificación', 'Fecha']],
          body: calificaciones.map(c => [
            estudiantes.find(e => e.id === c.estudianteId)?.nombre || 'N/A',
            materias.find(m => m.id === c.materiaId)?.nombre || 'N/A',
            c.calificacion,
            new Date(c.fecha).toLocaleDateString()
          ])
        });
        break;

      case 'asistencias':
        doc.text('Reporte de Asistencias', 20, 10);
        doc.autoTable({
          head: [['Estudiante', 'Materia', 'Fecha', 'Estado']],
          body: asistencias.map(a => [
            estudiantes.find(e => e.id === a.estudianteId)?.nombre || 'N/A',
            materias.find(m => m.id === a.materiaId)?.nombre || 'N/A',
            new Date(a.fecha).toLocaleDateString(),
            a.estado ? 'Presente' : 'Ausente'
          ])
        });
        break;
    }

    doc.save(`reporte_${type}_${new Date().toISOString()}.pdf`);
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
      <Paper sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Materias" />
            <Tab label="Calificaciones" />
            <Tab label="Asistencias" />
            <Tab label="Reportes" />
          </Tabs>
        </Box>

        {/* Panel de Materias */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Mis Materias
            </Typography>
            <List>
              {materias.map((materia) => (
                <ListItem key={materia.id}>
                  <ListItemText
                    primary={materia.nombre}
                    secondary={`Módulo: ${materia.modulo}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleOpenDialog('materia', materia)}>
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Panel de Calificaciones */}
        {tabValue === 1 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Calificaciones
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('calificacion')}
              >
                Nueva Calificación
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Estudiante</TableCell>
                    <TableCell>Materia</TableCell>
                    <TableCell>Calificación</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calificaciones.map((calificacion) => (
                    <TableRow key={calificacion.id}>
                      <TableCell>
                        {estudiantes.find(e => e.id === calificacion.estudianteId)?.nombre || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {materias.find(m => m.id === calificacion.materiaId)?.nombre || 'N/A'}
                      </TableCell>
                      <TableCell>{calificacion.calificacion}</TableCell>
                      <TableCell>{new Date(calificacion.fecha).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog('calificacion', calificacion)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete('calificaciones', calificacion.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Panel de Asistencias */}
        {tabValue === 2 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Registro de Asistencias
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('asistencia')}
              >
                Nueva Asistencia
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Estudiante</TableCell>
                    <TableCell>Materia</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {asistencias.map((asistencia) => (
                    <TableRow key={asistencia.id}>
                      <TableCell>
                        {estudiantes.find(e => e.id === asistencia.estudianteId)?.nombre || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {materias.find(m => m.id === asistencia.materiaId)?.nombre || 'N/A'}
                      </TableCell>
                      <TableCell>{new Date(asistencia.fecha).toLocaleDateString()}</TableCell>
                      <TableCell>{asistencia.estado ? 'Presente' : 'Ausente'}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog('asistencia', asistencia)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete('asistencias', asistencia.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Panel de Reportes */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Reportes
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => generateReport('calificaciones')}
                >
                  Reporte de Calificaciones
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => generateReport('asistencias')}
                >
                  Reporte de Asistencias
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Diálogos para formularios */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogType === 'calificacion' && (formData.id ? 'Editar' : 'Nueva') + ' Calificación'}
            {dialogType === 'asistencia' && (formData.id ? 'Editar' : 'Nueva') + ' Asistencia'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              {(dialogType === 'calificacion' || dialogType === 'asistencia') && (
                <>
                  <TextField
                    select
                    margin="normal"
                    required
                    fullWidth
                    label="Estudiante"
                    value={formData.estudianteId || ''}
                    onChange={(e) => setFormData({ ...formData, estudianteId: e.target.value })}
                  >
                    {estudiantes.map((estudiante) => (
                      <MenuItem key={estudiante.id} value={estudiante.id}>
                        {estudiante.nombre}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    margin="normal"
                    required
                    fullWidth
                    label="Materia"
                    value={formData.materiaId || ''}
                    onChange={(e) => setFormData({ ...formData, materiaId: e.target.value })}
                  >
                    {materias.map((materia) => (
                      <MenuItem key={materia.id} value={materia.id}>
                        {materia.nombre}
                      </MenuItem>
                    ))}
                  </TextField>

                  {dialogType === 'calificacion' && (
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Calificación"
                      type="number"
                      inputProps={{ min: 0, max: 100, step: 1 }}
                      value={formData.calificacion || ''}
                      onChange={(e) => setFormData({ ...formData, calificacion: parseFloat(e.target.value) })}
                    />
                  )}

                  {dialogType === 'asistencia' && (
                    <TextField
                      select
                      margin="normal"
                      required
                      fullWidth
                      label="Estado"
                      value={formData.estado || false}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value === 'true' })}
                    >
                      <MenuItem value="true">Presente</MenuItem>
                      <MenuItem value="false">Ausente</MenuItem>
                    </TextField>
                  )}

                  <TextField
                    margin="normal"
                    fullWidth
                    label="Observaciones"
                    multiline
                    rows={4}
                    value={formData.observaciones || ''}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">
              {formData.id ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default ProfesorPanel;
