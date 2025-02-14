import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Profesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    ci: '',
    email: '',
    telefono: '',
    especialidad: '',
    titulo: '',
    materias: [],
    estado: 'Activo',
    fechaIngreso: '',
    direccion: ''
  });

  const fetchProfesores = async () => {
    try {
      const profesoresSnapshot = await getDocs(collection(db, 'profesores'));
      const profesoresData = profesoresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProfesores(profesoresData);
    } catch (error) {
      console.error('Error al cargar profesores:', error);
      mostrarSnackbar('Error al cargar los profesores', 'error');
    }
  };

  useEffect(() => {
    fetchProfesores();
  }, []);

  const handleClickOpen = () => {
    setEditando(null);
    setFormData({
      nombre: '',
      apellidos: '',
      ci: '',
      email: '',
      telefono: '',
      especialidad: '',
      titulo: '',
      materias: [],
      estado: 'Activo',
      fechaIngreso: '',
      direccion: ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditando(null);
  };

  const handleEdit = (profesor) => {
    setEditando(profesor.id);
    setFormData({
      nombre: profesor.nombre || '',
      apellidos: profesor.apellidos || '',
      ci: profesor.ci || '',
      email: profesor.email || '',
      telefono: profesor.telefono || '',
      especialidad: profesor.especialidad || '',
      titulo: profesor.titulo || '',
      materias: profesor.materias || [],
      estado: profesor.estado || 'Activo',
      fechaIngreso: profesor.fechaIngreso || '',
      direccion: profesor.direccion || ''
    });
    setOpen(true);
  };

  const mostrarSnackbar = (mensaje, severidad) => {
    setSnackbar({ open: true, message: mensaje, severity: severidad });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await updateDoc(doc(db, 'profesores', editando), formData);
        mostrarSnackbar('Profesor actualizado exitosamente', 'success');
      } else {
        await addDoc(collection(db, 'profesores'), formData);
        mostrarSnackbar('Profesor registrado exitosamente', 'success');
      }
      handleClose();
      fetchProfesores();
    } catch (error) {
      console.error('Error:', error);
      mostrarSnackbar('Error al guardar el profesor', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este profesor?')) {
      try {
        await deleteDoc(doc(db, 'profesores', id));
        mostrarSnackbar('Profesor eliminado exitosamente', 'success');
        fetchProfesores();
      } catch (error) {
        console.error('Error:', error);
        mostrarSnackbar('Error al eliminar el profesor', 'error');
      }
    }
  };

  const materiasDisponibles = [
    'Música',
    'Danza',
    'Teatro',
    'Artes Plásticas',
    'Canto',
    'Piano',
    'Guitarra',
    'Violín',
    'Pintura',
    'Escultura'
  ];

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Gestión de Profesores
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Nuevo Profesor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>CI</TableCell>
              <TableCell>Nombre Completo</TableCell>
              <TableCell>Especialidad</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Materias</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profesores.map((profesor) => (
              <TableRow key={profesor.id}>
                <TableCell>{profesor.ci}</TableCell>
                <TableCell>{`${profesor.nombre} ${profesor.apellidos}`}</TableCell>
                <TableCell>{profesor.especialidad}</TableCell>
                <TableCell>{profesor.email}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      backgroundColor: profesor.estado === 'Activo' ? 'success.light' : 'error.light',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}
                  >
                    {profesor.estado}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {profesor.materias?.map((materia, index) => (
                      <Chip
                        key={index}
                        label={materia}
                        size="small"
                        icon={<SchoolIcon />}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(profesor)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(profesor.id)}
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editando ? 'Editar Profesor' : 'Nuevo Profesor'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Nombre"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Apellidos"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="CI"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.ci}
                  onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Teléfono"
                  type="tel"
                  fullWidth
                  variant="outlined"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Especialidad"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Título Profesional"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Fecha de Ingreso"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={formData.fechaIngreso}
                  onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    label="Estado"
                    required
                  >
                    <MenuItem value="Activo">Activo</MenuItem>
                    <MenuItem value="Inactivo">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Materias</InputLabel>
                  <Select
                    multiple
                    value={formData.materias}
                    onChange={(e) => setFormData({ ...formData, materias: e.target.value })}
                    label="Materias"
                    required
                  >
                    {materiasDisponibles.map((materia) => (
                      <MenuItem key={materia} value={materia}>
                        {materia}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Dirección"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {editando ? 'Actualizar' : 'Guardar'}
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

export default Profesores;
