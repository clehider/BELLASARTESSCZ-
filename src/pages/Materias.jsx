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
  Alert
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    profesor: '',
    creditos: '',
    horario: ''
  });

  const fetchMaterias = async () => {
    try {
      const materiasSnapshot = await getDocs(collection(db, 'materias'));
      const materiasData = materiasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterias(materiasData);
    } catch (error) {
      console.error('Error al cargar materias:', error);
      mostrarSnackbar('Error al cargar las materias', 'error');
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  const handleClickOpen = () => {
    setEditando(null);
    setFormData({
      nombre: '',
      descripcion: '',
      profesor: '',
      creditos: '',
      horario: ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditando(null);
  };

  const handleEdit = (materia) => {
    setEditando(materia.id);
    setFormData({
      nombre: materia.nombre,
      descripcion: materia.descripcion,
      profesor: materia.profesor,
      creditos: materia.creditos,
      horario: materia.horario
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
        await updateDoc(doc(db, 'materias', editando), formData);
        mostrarSnackbar('Materia actualizada exitosamente', 'success');
      } else {
        await addDoc(collection(db, 'materias'), formData);
        mostrarSnackbar('Materia creada exitosamente', 'success');
      }
      handleClose();
      fetchMaterias();
    } catch (error) {
      console.error('Error:', error);
      mostrarSnackbar('Error al guardar la materia', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta materia?')) {
      try {
        await deleteDoc(doc(db, 'materias', id));
        mostrarSnackbar('Materia eliminada exitosamente', 'success');
        fetchMaterias();
      } catch (error) {
        console.error('Error:', error);
        mostrarSnackbar('Error al eliminar la materia', 'error');
      }
    }
  };

  return (
    <Container>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Materias
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Nueva Materia
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Profesor</TableCell>
              <TableCell>Créditos</TableCell>
              <TableCell>Horario</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materias.map((materia) => (
              <TableRow key={materia.id}>
                <TableCell>{materia.nombre}</TableCell>
                <TableCell>{materia.descripcion}</TableCell>
                <TableCell>{materia.profesor}</TableCell>
                <TableCell>{materia.creditos}</TableCell>
                <TableCell>{materia.horario}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(materia)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(materia.id)}
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
        <DialogTitle>{editando ? 'Editar Materia' : 'Nueva Materia'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
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
            <TextField
              margin="dense"
              label="Descripción"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              multiline
              rows={3}
            />
            <TextField
              margin="dense"
              label="Profesor"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.profesor}
              onChange={(e) => setFormData({ ...formData, profesor: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Créditos"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.creditos}
              onChange={(e) => setFormData({ ...formData, creditos: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Horario"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.horario}
              onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
              required
            />
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

export default Materias;
