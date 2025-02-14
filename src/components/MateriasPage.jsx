import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Box,
  Chip,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MateriasPage = () => {
  const [materias, setMaterias] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentMateria, setCurrentMateria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    moduloId: '',
    creditos: 4,
    estado: 'activo'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [materiasSnapshot, modulosSnapshot] = await Promise.all([
        getDocs(collection(db, 'materias')),
        getDocs(collection(db, 'modulos'))
      ]);

      const materiasData = materiasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      const modulosData = modulosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMaterias(materiasData);
      setModulos(modulosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (materia = null) => {
    if (materia) {
      setCurrentMateria(materia);
      setFormData({
        nombre: materia.nombre,
        descripcion: materia.descripcion,
        moduloId: materia.moduloId,
        creditos: materia.creditos,
        estado: materia.estado
      });
    } else {
      setCurrentMateria(null);
      setFormData({
        nombre: '',
        descripcion: '',
        moduloId: '',
        creditos: 4,
        estado: 'activo'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentMateria(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentMateria) {
        await updateDoc(doc(db, 'materias', currentMateria.id), {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'materias'), {
          ...formData,
          createdAt: new Date()
        });
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error al guardar:', error);
      setError('Error al guardar la materia');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta materia?')) {
      try {
        await deleteDoc(doc(db, 'materias', id));
        fetchData();
      } catch (error) {
        console.error('Error al eliminar:', error);
        setError('Error al eliminar la materia');
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Materias
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Materia
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {materias.map((materia) => (
          <Grid item xs={12} sm={6} md={4} key={materia.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BookIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h3">
                    {materia.nombre}
                  </Typography>
                </Box>
                <Typography color="textSecondary" paragraph>
                  {materia.descripcion}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip
                    label={`${materia.creditos} créditos`}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={materia.estado}
                    color={materia.estado === 'activo' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Módulo: {modulos.find(m => m.id === materia.moduloId)?.nombre || 'No asignado'}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(materia)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(materia.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentMateria ? 'Editar Materia' : 'Nueva Materia'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre de la Materia"
              fullWidth
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Descripción"
              fullWidth
              multiline
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
            />
            <TextField
              select
              margin="dense"
              label="Módulo"
              fullWidth
              value={formData.moduloId}
              onChange={(e) => setFormData({ ...formData, moduloId: e.target.value })}
              required
            >
              {modulos.map((modulo) => (
                <MenuItem key={modulo.id} value={modulo.id}>
                  {modulo.nombre}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              label="Créditos"
              type="number"
              fullWidth
              value={formData.creditos}
              onChange={(e) => setFormData({ ...formData, creditos: parseInt(e.target.value) })}
              InputProps={{ inputProps: { min: 1, max: 10 } }}
              required
            />
            <TextField
              select
              margin="dense"
              label="Estado"
              fullWidth
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            >
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentMateria ? 'Guardar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default MateriasPage;
