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
  Chip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import SeleccionarMateriasModal from '../components/SeleccionarMateriasModal';

const Profesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [open, setOpen] = useState(false);
  const [openMateriasModal, setOpenMateriasModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    ci: '',
    especialidad: '',
    materias: []
  });

  const fetchMaterias = useCallback(async () => {
    try {
      const materiasSnapshot = await getDocs(collection(db, 'materias'));
      const materiasData = materiasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterias(materiasData);
      return materiasData;
    } catch (error) {
      console.error('Error al cargar materias:', error);
      mostrarSnackbar('Error al cargar las materias', 'error');
      return [];
    }
  }, []);

  const fetchProfesores = useCallback(async (materiasData) => {
    setLoadingData(true);
    try {
      const profesoresSnapshot = await getDocs(collection(db, 'profesores'));
      const profesoresData = profesoresSnapshot.docs.map(doc => {
        const profesor = { id: doc.id, ...doc.data() };
        // Asignar los datos de las materias
        if (profesor.materias && profesor.materias.length > 0) {
          profesor.materiasData = profesor.materias.map(materiaId => 
            materiasData.find(m => m.id === materiaId)
          ).filter(Boolean);
        }
        return profesor;
      });
      setProfesores(profesoresData);
    } catch (error) {
      console.error('Error al cargar profesores:', error);
      mostrarSnackbar('Error al cargar los profesores', 'error');
    } finally {
      setLoadingData(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const inicializarDatos = async () => {
      const materiasData = await fetchMaterias();
      await fetchProfesores(materiasData);
    };
    inicializarDatos();
  }, [fetchMaterias, fetchProfesores]);

  const mostrarSnackbar = (mensaje, severidad) => {
    setSnackbar({ open: true, message: mensaje, severity: severidad });
  };

  const handleClickOpen = () => {
    setEditando(null);
    setFormData({
      nombre: '',
      apellidos: '',
      ci: '',
      especialidad: '',
      materias: []
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
      especialidad: profesor.especialidad || '',
      materias: profesor.materias || []
    });
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingData(true);
    try {
      const profesorData = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        ci: formData.ci,
        especialidad: formData.especialidad,
        materias: formData.materias,
        fechaActualizacion: new Date().toISOString()
      };

      if (editando) {
        await updateDoc(doc(db, 'profesores', editando), profesorData);
        mostrarSnackbar('Profesor actualizado exitosamente', 'success');
      } else {
        await addDoc(collection(db, 'profesores'), {
          ...profesorData,
          fechaCreacion: new Date().toISOString()
        });
        mostrarSnackbar('Profesor registrado exitosamente', 'success');
      }
      handleClose();
      const materiasData = await fetchMaterias();
      await fetchProfesores(materiasData);
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
        const materiasData = await fetchMaterias();
        await fetchProfesores(materiasData);
      } catch (error) {
        console.error('Error:', error);
        mostrarSnackbar('Error al eliminar el profesor', 'error');
      } finally {
        setLoadingData(false);
      }
    }
  };

  const handleSaveSelection = (materiasSeleccionadas) => {
    setFormData(prev => ({
      ...prev,
      materias: materiasSeleccionadas
    }));
  };

  const getMateriaName = (materiaId) => {
    const materia = materias.find(m => m.id === materiaId);
    return materia ? materia.nombre : 'Materia no encontrada';
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
        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>CI</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Especialidad</TableCell>
                <TableCell>Materias Asignadas</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profesores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No hay profesores registrados
                  </TableCell>
                </TableRow>
              ) : (
                profesores.map((profesor) => (
                  <TableRow key={profesor.id}>
                    <TableCell>{profesor.ci}</TableCell>
                    <TableCell>{`${profesor.nombre} ${profesor.apellidos}`}</TableCell>
                    <TableCell>{profesor.especialidad}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {profesor.materias?.map((materiaId) => (
                          <Chip
                            key={materiaId}
                            label={getMateriaName(materiaId)}
                            size="small"
                            icon={<ClassIcon />}
                            sx={{ m: 0.5 }}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(profesor)}
                        size="small"
                        disabled={loadingData}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(profesor.id)}
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
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ClassIcon />}
                    onClick={() => setOpenMateriasModal(true)}
                    disabled={loadingData}
                  >
                    Seleccionar Materias
                  </Button>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {formData.materias.map((materiaId) => (
                    <Chip
                      key={materiaId}
                      label={getMateriaName(materiaId)}
                      onDelete={() => setFormData(prev => ({
                        ...prev,
                        materias: prev.materias.filter(id => id !== materiaId)
                      }))}
                      size="small"
                      disabled={loadingData}
                    />
                  ))}
                </Stack>
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

      <SeleccionarMateriasModal
        open={openMateriasModal}
        onClose={() => setOpenMateriasModal(false)}
        materias={materias}
        materiasSeleccionadas={formData.materias}
        onSaveSelection={handleSaveSelection}
        loading={loadingData}
      />

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
