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

const Materias = () => {
  const [materias, setMaterias] = useState([]);
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
    codigo: '',
    nombre: '',
    descripcion: '',
    creditos: '',
    semestre: '',
    estado: 'activo'
  });

  const fetchMaterias = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'materias'));
      const materiasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterias(materiasData);
    } catch (error) {
      console.error('Error:', error);
      mostrarSnackbar('Error al cargar las materias', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  const mostrarSnackbar = (mensaje, severidad) => {
    setSnackbar({ open: true, message: mensaje, severity: severidad });
  };

  const handleClickOpen = () => {
    setEditando(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      creditos: '',
      semestre: '',
      estado: 'activo'
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditando(null);
  };

  const handleEdit = (materia) => {
    setEditando(materia.id);
    setFormData({ ...materia });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingData(true);

    try {
      const materiaData = {
        ...formData,
        creditos: parseInt(formData.creditos),
        semestre: parseInt(formData.semestre),
        fechaActualizacion: new Date().toISOString()
      };

      if (editando) {
        await updateDoc(doc(db, 'materias', editando), materiaData);
        mostrarSnackbar('Materia actualizada exitosamente', 'success');
      } else {
        materiaData.fechaCreacion = new Date().toISOString();
        await addDoc(collection(db, 'materias'), materiaData);
        mostrarSnackbar('Materia registrada exitosamente', 'success');
      }

      handleClose();
      await fetchMaterias();
    } catch (error) {
      console.error('Error:', error);
      mostrarSnackbar('Error al guardar la materia', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta materia?')) {
      setLoadingData(true);
      try {
        await deleteDoc(doc(db, 'materias', id));
        mostrarSnackbar('Materia eliminada exitosamente', 'success');
        await fetchMaterias();
      } catch (error) {
        console.error('Error:', error);
        mostrarSnackbar('Error al eliminar la materia', 'error');
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
          Gestión de Materias
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
          disabled={loadingData}
        >
          Nueva Materia
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Créditos</TableCell>
              <TableCell>Semestre</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay materias registradas
                </TableCell>
              </TableRow>
            ) : (
              materias.map((materia) => (
                <TableRow key={materia.id}>
                  <TableCell>{materia.codigo}</TableCell>
                  <TableCell>{materia.nombre}</TableCell>
                  <TableCell>{materia.creditos}</TableCell>
                  <TableCell>{materia.semestre}</TableCell>
                  <TableCell>{materia.estado}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(materia)}
                      disabled={loadingData}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(materia.id)}
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
          {editando ? 'Editar Materia' : 'Nueva Materia'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Código"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                  disabled={loadingData}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
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
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Descripción"
                  type="text"
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  disabled={loadingData}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Créditos"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.creditos}
                  onChange={(e) => setFormData({ ...formData, creditos: e.target.value })}
                  required
                  disabled={loadingData}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Semestre"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.semestre}
                  onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                  required
                  disabled={loadingData}
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
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

export default Materias;
