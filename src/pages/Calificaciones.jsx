import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const Calificaciones = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    estudiante_id: '',
    materia_id: '',
    profesor_id: '',
    calificacion: '',
    fecha: new Date().toISOString().split('T')[0],
    periodo: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar estudiantes
      const estudiantesSnapshot = await getDocs(collection(db, 'estudiantes'));
      const estudiantesData = estudiantesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEstudiantes(estudiantesData);

      // Cargar materias
      const materiasSnapshot = await getDocs(collection(db, 'materias'));
      const materiasData = materiasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterias(materiasData);

      // Cargar profesores
      const profesoresSnapshot = await getDocs(collection(db, 'profesores'));
      const profesoresData = profesoresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProfesores(profesoresData);

      // Cargar calificaciones
      const calificacionesSnapshot = await getDocs(collection(db, 'calificaciones'));
      const calificacionesData = await Promise.all(calificacionesSnapshot.docs.map(async doc => {
        const calificacion = { id: doc.id, ...doc.data() };
        
        // Obtener datos relacionados
        const estudiante = estudiantesData.find(e => e.id === calificacion.estudiante_id) || {};
        const materia = materiasData.find(m => m.id === calificacion.materia_id) || {};
        const profesor = profesoresData.find(p => p.id === calificacion.profesor_id) || {};

        return {
          ...calificacion,
          estudiante_nombre: `${estudiante.nombre || ''} ${estudiante.apellidos || ''}`,
          materia_nombre: materia.nombre || '',
          profesor_nombre: `${profesor.nombre || ''} ${profesor.apellidos || ''}`
        };
      }));

      setCalificaciones(calificacionesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarSnackbar('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mostrarSnackbar = (mensaje, severidad) => {
    setSnackbar({ open: true, message: mensaje, severity: severidad });
  };

  const handleClickOpen = () => {
    setEditando(null);
    setFormData({
      estudiante_id: '',
      materia_id: '',
      profesor_id: '',
      calificacion: '',
      fecha: new Date().toISOString().split('T')[0],
      periodo: '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditando(null);
  };


  const handleEdit = (calificacion) => {
    setEditando(calificacion.id);
    setFormData({
      estudiante_id: calificacion.estudiante_id || '',
      materia_id: calificacion.materia_id || '',
      profesor_id: calificacion.profesor_id || '',
      calificacion: calificacion.calificacion || '',
      fecha: calificacion.fecha || new Date().toISOString().split('T')[0],
      periodo: calificacion.periodo || '',
    });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingData(true);
    try {
      const calificacionData = {
        estudiante_id: formData.estudiante_id,
        materia_id: formData.materia_id,
        profesor_id: formData.profesor_id,
        calificacion: parseFloat(formData.calificacion),
        fecha: formData.fecha,
        periodo: formData.periodo,
        fechaActualizacion: new Date().toISOString()
      };

      if (editando) {
        await updateDoc(doc(db, 'calificaciones', editando), calificacionData);
        mostrarSnackbar('Calificación actualizada exitosamente', 'success');
      } else {
        await addDoc(collection(db, 'calificaciones'), {
          ...calificacionData,
          fechaCreacion: new Date().toISOString()
        });
        mostrarSnackbar('Calificación registrada exitosamente', 'success');
      }
      handleClose();
      await fetchData();
    } catch (error) {
      console.error('Error:', error);
      mostrarSnackbar('Error al guardar la calificación', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta calificación?')) {
      setLoadingData(true);
      try {
        await deleteDoc(doc(db, 'calificaciones', id));
        mostrarSnackbar('Calificación eliminada exitosamente', 'success');
        await fetchData();
      } catch (error) {
        console.error('Error:', error);
        mostrarSnackbar('Error al eliminar la calificación', 'error');
      } finally {
        setLoadingData(false);
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Gestión de Calificaciones
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
          disabled={loadingData}
        >
          Nueva Calificación
        </Button>
      </Box>

      <TableContainer component={Paper}>
        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Estudiante</TableCell>
                <TableCell>Materia</TableCell>
                <TableCell>Profesor</TableCell>
                <TableCell>Calificación</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Periodo</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calificaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay calificaciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                calificaciones.map((calificacion) => (
                  <TableRow key={calificacion.id}>
                    <TableCell>{calificacion.estudiante_nombre}</TableCell>
                    <TableCell>{calificacion.materia_nombre}</TableCell>
                    <TableCell>{calificacion.profesor_nombre}</TableCell>
                    <TableCell>{calificacion.calificacion}</TableCell>
                    <TableCell>{calificacion.fecha}</TableCell>
                    <TableCell>{calificacion.periodo}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(calificacion)}
                        size="small"
                        disabled={loadingData}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(calificacion.id)}
                        size="small"
                        disabled={loadingData}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown={loadingData}
      >
        <DialogTitle>
          {editando ? 'Editar Calificación' : 'Nueva Calificación'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Estudiante</InputLabel>
                  <Select
                    value={formData.estudiante_id}
                    label="Estudiante"
                    onChange={(e) => setFormData({ ...formData, estudiante_id: e.target.value })}
                    required
                    disabled={loadingData}
                  >
                    {estudiantes.map((estudiante) => (
                      <MenuItem key={estudiante.id} value={estudiante.id}>
                        {`${estudiante.nombre} ${estudiante.apellidos}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Materia</InputLabel>
                  <Select
                    value={formData.materia_id}
                    label="Materia"
                    onChange={(e) => setFormData({ ...formData, materia_id: e.target.value })}
                    required
                    disabled={loadingData}
                  >
                    {materias.map((materia) => (
                      <MenuItem key={materia.id} value={materia.id}>
                        {materia.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Profesor</InputLabel>
                  <Select
                    value={formData.profesor_id}
                    label="Profesor"
                    onChange={(e) => setFormData({ ...formData, profesor_id: e.target.value })}
                    required
                    disabled={loadingData}
                  >
                    {profesores.map((profesor) => (
                      <MenuItem key={profesor.id} value={profesor.id}>
                        {`${profesor.nombre} ${profesor.apellidos}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Calificación"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.calificacion}
                  onChange={(e) => setFormData({ ...formData, calificacion: e.target.value })}
                  required
                  inputProps={{ min: "0", max: "100", step: "0.01" }}
                  disabled={loadingData}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Fecha"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={loadingData}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Periodo"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.periodo}
                  onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                  required
                  disabled={loadingData}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loadingData}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loadingData}
            >
              {loadingData ? <CircularProgress size={24} /> : (editando ? 'Actualizar' : 'Guardar')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Calificaciones;
