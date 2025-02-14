import { Grid } from "@mui/material";
import React, { useState, useEffect } from 'react';
import {
  Container,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    email: '',
    telefono: '',
    direccion: '',
    fechaNacimiento: '',
    genero: '',
    estado: 'Activo'
  });

  const fetchEstudiantes = async () => {
    try {
      const estudiantesSnapshot = await getDocs(collection(db, 'estudiantes'));
      const estudiantesData = estudiantesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEstudiantes(estudiantesData);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      mostrarSnackbar('Error al cargar los estudiantes', 'error');
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const handleClickOpen = () => {
    setEditando(null);
    setFormData({
      nombre: '',
      apellido: '',
      ci: '',
      email: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      genero: '',
      estado: 'Activo'
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditando(null);
  };

  const handleEdit = (estudiante) => {
    setEditando(estudiante.id);
    setFormData({
      nombre: estudiante.nombre || '',
      apellido: estudiante.apellido || '',
      ci: estudiante.ci || '',
      email: estudiante.email || '',
      telefono: estudiante.telefono || '',
      direccion: estudiante.direccion || '',
      fechaNacimiento: estudiante.fechaNacimiento || '',
      genero: estudiante.genero || '',
      estado: estudiante.estado || 'Activo'
    });
    setOpen(true);
  };

  const mostrarSnackbar = (mensaje, severidad) => {
    setSnackbar({ open: true, message: mensaje, severity: severidad });
  };

  const validarFormulario = () => {
    if (!formData.email.includes('@')) {
      mostrarSnackbar('El email no es válido', 'error');
      return false;
    }
    if (formData.ci.length < 5) {
      mostrarSnackbar('El CI debe tener al menos 5 caracteres', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      if (editando) {
        await updateDoc(doc(db, 'estudiantes', editando), formData);
        mostrarSnackbar('Estudiante actualizado exitosamente', 'success');
      } else {
        await addDoc(collection(db, 'estudiantes'), formData);
        mostrarSnackbar('Estudiante creado exitosamente', 'success');
      }
      handleClose();
      fetchEstudiantes();
    } catch (error) {
      console.error('Error:', error);
      mostrarSnackbar('Error al guardar el estudiante', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este estudiante?')) {
      try {
        await deleteDoc(doc(db, 'estudiantes', id));
        mostrarSnackbar('Estudiante eliminado exitosamente', 'success');
        fetchEstudiantes();
      } catch (error) {
        console.error('Error:', error);
        mostrarSnackbar('Error al eliminar el estudiante', 'error');
      }
    }
  };

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Estudiantes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Nuevo Estudiante
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>CI</TableCell>
              <TableCell>Nombre Completo</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estudiantes.map((estudiante) => (
              <TableRow key={estudiante.id}>
                <TableCell>{estudiante.ci}</TableCell>
                <TableCell>{`${estudiante.nombre} ${estudiante.apellido}`}</TableCell>
                <TableCell>{estudiante.email}</TableCell>
                <TableCell>{estudiante.telefono}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      backgroundColor: estudiante.estado === 'Activo' ? 'success.light' : 'error.light',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}
                  >
                    {estudiante.estado}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(estudiante)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(estudiante.id)}
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
        <DialogTitle>{editando ? 'Editar Estudiante' : 'Nuevo Estudiante'}</DialogTitle>
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
                  label="Apellido"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
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
                  label="Fecha de Nacimiento"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Género</InputLabel>
                  <Select
                    value={formData.genero}
                    onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                    label="Género"
                    required
                  >
                    <MenuItem value="Masculino">Masculino</MenuItem>
                    <MenuItem value="Femenino">Femenino</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </Select>
                </FormControl>
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
              {editando ? 'Actualizar' : 'Crear'}
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

export default Estudiantes;
