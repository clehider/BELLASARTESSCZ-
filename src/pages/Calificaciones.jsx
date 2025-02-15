import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Calificaciones = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [calificacionData, setCalificacionData] = useState({
    estudiante_id: '',
    materia_id: '',
    calificacion: '',
    periodo: '',
    fecha: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Obtener estudiantes
      const estudiantesSnapshot = await getDocs(collection(db, 'estudiantes'));
      const estudiantesData = estudiantesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEstudiantes(estudiantesData);

      // Obtener materias
      const materiasSnapshot = await getDocs(collection(db, 'materias'));
      const materiasData = materiasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterias(materiasData);

      // Obtener calificaciones
      const calificacionesSnapshot = await getDocs(collection(db, 'calificaciones'));
      const calificacionesData = calificacionesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCalificaciones(calificacionesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setEditingId(null);
    setCalificacionData({
      estudiante_id: '',
      materia_id: '',
      calificacion: '',
      periodo: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCalificacionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const calificacionValue = parseFloat(calificacionData.calificacion);
      if (isNaN(calificacionValue) || calificacionValue < 0 || calificacionValue > 100) {
        setError('La calificación debe ser un número entre 0 y 100');
        return;
      }

      // Obtener datos adicionales
      const estudiante = estudiantes.find(e => e.id === calificacionData.estudiante_id);
      const materia = materias.find(m => m.id === calificacionData.materia_id);

      const calificacionToSave = {
        ...calificacionData,
        calificacion: calificacionValue,
        estudiante_nombre: `${estudiante.nombre} ${estudiante.apellidos}`,
        materia_nombre: materia.nombre,
        materia_codigo: materia.codigo
      };

      if (editingId) {
        await updateDoc(doc(db, 'calificaciones', editingId), calificacionToSave);
      } else {
        await addDoc(collection(db, 'calificaciones'), calificacionToSave);
      }

      await fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving calificacion:', error);
      setError('Error al guardar la calificación');
    }
  };

  const handleEdit = (calificacion) => {
    setEditingId(calificacion.id);
    setCalificacionData({
      estudiante_id: calificacion.estudiante_id,
      materia_id: calificacion.materia_id,
      calificacion: calificacion.calificacion.toString(),
      periodo: calificacion.periodo,
      fecha: calificacion.fecha
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta calificación?')) {
      try {
        await deleteDoc(doc(db, 'calificaciones', id));
        await fetchData();
      } catch (error) {
        console.error('Error deleting calificacion:', error);
        setError('Error al eliminar la calificación');
      }
    }
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
          Gestión de Calificaciones
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
          sx={{ mb: 4 }}
        >
          Nueva Calificación
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Estudiante</TableCell>
                <TableCell>Materia</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Calificación</TableCell>
                <TableCell>Periodo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calificaciones.map((calificacion) => (
                <TableRow key={calificacion.id}>
                  <TableCell>{calificacion.estudiante_nombre}</TableCell>
                  <TableCell>{calificacion.materia_nombre}</TableCell>
                  <TableCell>{calificacion.materia_codigo}</TableCell>
                  <TableCell>{calificacion.calificacion}</TableCell>
                  <TableCell>{calificacion.periodo}</TableCell>
                  <TableCell>{calificacion.fecha}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(calificacion)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(calificacion.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingId ? 'Editar Calificación' : 'Nueva Calificación'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Estudiante</InputLabel>
                    <Select
                      name="estudiante_id"
                      value={calificacionData.estudiante_id}
                      onChange={handleInputChange}
                      label="Estudiante"
                      required
                    >
                      {estudiantes.map((estudiante) => (
                        <MenuItem key={estudiante.id} value={estudiante.id}>
                          {`${estudiante.nombre} ${estudiante.apellidos}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Materia</InputLabel>
                    <Select
                      name="materia_id"
                      value={calificacionData.materia_id}
                      onChange={handleInputChange}
                      label="Materia"
                      required
                    >
                      {materias.map((materia) => (
                        <MenuItem key={materia.id} value={materia.id}>
                          {`${materia.nombre} (${materia.codigo})`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Calificación"
                    name="calificacion"
                    type="number"
                    value={calificacionData.calificacion}
                    onChange={handleInputChange}
                    required
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Periodo"
                    name="periodo"
                    value={calificacionData.periodo}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Fecha"
                    name="fecha"
                    type="date"
                    value={calificacionData.fecha}
                    onChange={handleInputChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingId ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Calificaciones;
