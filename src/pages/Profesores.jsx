import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Profesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    ci: '',
    telefono: '',
    email: '',
    especialidad: '',
    estado: 'activo'
  });

  const fetchProfesores = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'profesores'));
      const profesoresData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProfesores(profesoresData);
    } catch (error) {
      console.error('Error:', error);
      mostrarSnackbar('Error al cargar los profesores', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfesores();
  }, []);

  const mostrarSnackbar = (mensaje, severidad) => {
    setSnackbar({ open: true, message: mensaje, severity: severidad });
  };

  const handleClickOpen = () => {
    setEditando(null);
    setFormData({
      nombre: '',
      apellidos: '',
      ci: '',
      telefono: '',
      email: '',
      especialidad: '',
      estado: 'activo'
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditando(null);
  };

  const handleEdit = (profesor) => {
    setEditando(profesor.id);
    setFormData({ ...profesor });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingData(true);

    try {
      const profesorData = {
        ...formData,
        fechaActualizacion: new Date().toISOString()
      };

      if (editando) {
        await updateDoc(doc(db, 'profesores', editando), profesorData);
        mostrarSnackbar('Profesor actualizado exitosamente', 'success');
      } else {
        profesorData.fechaCreacion = new Date().toISOString();
        await addDoc(collection(db, 'profesores'), profesorData);
        mostrarSnackbar('Profesor registrado exitosamente', 'success');
      }

      handleClose();
      await fetchProfesores();
    } catch (error) {
      console.error('Error:', error);
      mostrarSnackbar('Error al guardar el profesor', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este profesor?')) {
      setLoadingData(true);
      try {
        await deleteDoc(doc(db, 'profesores', id));
        mostrarSnackbar('Profesor eliminado exitosamente', 'success');
        await fetchProfesores();
      } catch (error) {
        console.error('Error:', error);
        mostrarSnackbar('Error al eliminar el profesor', 'error');
      } finally {
        setLoadingData(false);
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Gestión de Profesores
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
          disabled={loadingData}
        >
          Nuevo Profesor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>CI</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellidos</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Especialidad</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profesores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay profesores registrados
                </TableCell>
              </TableRow>
            ) : (
              profesores.map((profesor) => (
                <TableRow key={profesor.id}>
                  <TableCell>{profesor.ci}</TableCell>
                  <TableCell>{profesor.nombre}</TableCell>
                  <TableCell>{profesor.apellidos}</TableCell>
                  <TableCell>{profesor.email}</TableCell>
                  <TableCell>{profesor.especialidad}</TableCell>
                  <TableCell>{profesor.estado}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(profesor)}
                      disabled={loadingData}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(profesor.id)}
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
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
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
                  disabled={loadingData}
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
                  disabled={loadingData}
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
                  disabled={loadingData}
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
                  disabled={loadingData}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Teléfono"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  disabled={loadingData}
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
                  disabled={loadingData}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Estado"
                  select
                  fullWidth
                  variant="outlined"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  required
                  disabled={loadingData}
                >
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
                </TextField>
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

export default Profesores;
