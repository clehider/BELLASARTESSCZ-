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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ModulosPage = () => {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentModulo, setCurrentModulo] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'activo'
  });

  useEffect(() => {
    fetchModulos();
  }, []);

  const fetchModulos = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'modulos'));
      const modulosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setModulos(modulosData);
    } catch (error) {
      console.error('Error al cargar módulos:', error);
      setError('Error al cargar los módulos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (modulo = null) => {
    if (modulo) {
      setCurrentModulo(modulo);
      setFormData({
        nombre: modulo.nombre,
        descripcion: modulo.descripcion,
        estado: modulo.estado
      });
    } else {
      setCurrentModulo(null);
      setFormData({
        nombre: '',
        descripcion: '',
        estado: 'activo'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentModulo(null);
    setFormData({
      nombre: '',
      descripcion: '',
      estado: 'activo'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentModulo) {
        await updateDoc(doc(db, 'modulos', currentModulo.id), {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'modulos'), {
          ...formData,
          createdAt: new Date()
        });
      }
      handleCloseDialog();
      fetchModulos();
    } catch (error) {
      console.error('Error al guardar:', error);
      setError('Error al guardar el módulo');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este módulo?')) {
      try {
        await deleteDoc(doc(db, 'modulos', id));
        fetchModulos();
      } catch (error) {
        console.error('Error al eliminar:', error);
        setError('Error al eliminar el módulo');
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
          Módulos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Módulo
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {modulos.map((modulo) => (
          <Grid item xs={12} sm={6} md={4} key={modulo.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h3">
                    {modulo.nombre}
                  </Typography>
                </Box>
                <Typography color="textSecondary" paragraph>
                  {modulo.descripcion}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={modulo.estado}
                    color={modulo.estado === 'activo' ? 'success' : 'default'}
                    size="small"
                  />
                  <Typography variant="caption" color="textSecondary">
                    Creado: {format(modulo.createdAt, 'dd/MM/yyyy', { locale: es })}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(modulo)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(modulo.id)}
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
          {currentModulo ? 'Editar Módulo' : 'Nuevo Módulo'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre del Módulo"
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
              label="Estado"
              fullWidth
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              SelectProps={{
                native: true,
              }}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentModulo ? 'Guardar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ModulosPage;
