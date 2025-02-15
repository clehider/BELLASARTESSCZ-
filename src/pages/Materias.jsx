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
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import SeleccionarProfesorModal from '../components/SeleccionarProfesorModal';

const Materias = () => {
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openProfesorModal, setOpenProfesorModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    horasDiarias: '',
    horarioInicio: '',
    horarioFin: '',
    profesorId: '',
    profesorNombre: ''
  });

  const fetchMaterias = useCallback(async () => {
    setLoading(true);
    try {
      const materiasSnapshot = await getDocs(collection(db, 'materias'));
      const materiasPromises = materiasSnapshot.docs.map(async doc => {
        const materia = { id: doc.id, ...doc.data() };
        if (materia.profesorId) {
          try {
            const profesorDoc = await getDoc(doc(db, 'profesores', materia.profesorId));
            if (profesorDoc.exists()) {
              const profesorData = profesorDoc.data();
              materia.profesorNombre = `${profesorData.nombre} ${profesorData.apellidos}`;
            }
          } catch (error) {
            console.error('Error al cargar profesor para materia:', error);
            materia.profesorNombre = 'No disponible';
          }
        }
        return materia;
      });

      const materiasData = await Promise.all(materiasPromises);
      setMaterias(materiasData);
    } catch (error) {
      console.error('Error al cargar materias:', error);
      mostrarSnackbar('Error al cargar las materias', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfesores = useCallback(async () => {
    try {
      const profesoresSnapshot = await getDocs(collection(db, 'profesores'));
      const profesoresData = profesoresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProfesores(profesoresData);
    } catch (error) {
      console.error('Error al cargar profesores:', error);
      mostrarSnackbar('Error al cargar profesores', 'error');
    }
  }, []);

  useEffect(() => {
    const inicializarDatos = async () => {
      await Promise.all([
        fetchProfesores(),
        fetchMaterias()
      ]);
    };
    inicializarDatos();
  }, [fetchProfesores, fetchMaterias]);

  const handleClickOpen = () => {
    setEditando(null);
    setFormData({
      nombre: '',
      codigo: '',
      horasDiarias: '',
      horarioInicio: '',
      horarioFin: '',
      profesorId: '',
      profesorNombre: ''
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
      nombre: materia.nombre || '',
      codigo: materia.codigo || '',
      horasDiarias: materia.horasDiarias || '',
      horarioInicio: materia.horarioInicio || '',
      horarioFin: materia.horarioFin || '',
      profesorId: materia.profesorId || '',
      profesorNombre: materia.profesorNombre || ''
    });
    setOpen(true);
  };

  const mostrarSnackbar = (mensaje, severidad) => {
    setSnackbar({ open: true, message: mensaje, severity: severidad });
  };

  const handleSelectProfesor = (profesor) => {
    setFormData({
      ...formData,
      profesorId: profesor.id,
      profesorNombre: `${profesor.nombre} ${profesor.apellidos}`
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const materiaData = {
        nombre: formData.nombre,
        codigo: formData.codigo,
        horasDiarias: parseInt(formData.horasDiarias) || 0,
        horarioInicio: formData.horarioInicio,
        horarioFin: formData.horarioFin,
        profesorId: formData.profesorId,
        ultimaActualizacion: new Date().toISOString()
      };

      if (editando) {
        await updateDoc(doc(db, 'materias', editando), materiaData);
        mostrarSnackbar('Materia actualizada exitosamente', 'success');
      } else {
        await addDoc(collection(db, 'materias'), {
          ...materiaData,
          fechaCreacion: new Date().toISOString()
        });
        mostrarSnackbar('Materia registrada exitosamente', 'success');
      }
      handleClose();
      await fetchMaterias();
    } catch (error) {
      console.error('Error:', error);
      mostrarSnackbar('Error al guardar la materia', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta materia?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'materias', id));
        mostrarSnackbar('Materia eliminada exitosamente', 'success');
        await fetchMaterias();
      } catch (error) {
        console.error('Error:', error);
        mostrarSnackbar('Error al eliminar la materia', 'error');
      } finally {
        setLoading(false);
      }
    }
  };


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
          disabled={loading}
        >
          Nueva Materia
        </Button>
      </Box>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Profesor</TableCell>
                <TableCell>Horas Diarias</TableCell>
                <TableCell>Horario</TableCell>
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
                    <TableCell>{materia.profesorNombre || 'No asignado'}</TableCell>
                    <TableCell>{materia.horasDiarias} horas</TableCell>
                    <TableCell>
                      {materia.horarioInicio && materia.horarioFin 
                        ? `${materia.horarioInicio} - ${materia.horarioFin}`
                        : 'No definido'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(materia)}
                        size="small"
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(materia.id)}
                        size="small"
                        disabled={loading}
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
        disableEscapeKeyDown={loading}
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
                  label="Nombre de la Materia"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Código"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Profesor"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.profesorNombre}
                  onClick={() => !loading && setOpenProfesorModal(true)}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => !loading && setOpenProfesorModal(true)}
                          disabled={loading}
                        >
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Horas Diarias"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.horasDiarias}
                  onChange={(e) => setFormData({ ...formData, horasDiarias: e.target.value })}
                  required
                  InputProps={{
                    inputProps: { min: 1, max: 8 }
                  }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Horario Inicio"
                  type="time"
                  fullWidth
                  variant="outlined"
                  value={formData.horarioInicio}
                  onChange={(e) => setFormData({ ...formData, horarioInicio: e.target.value })}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Horario Fin"
                  type="time"
                  fullWidth
                  variant="outlined"
                  value={formData.horarioFin}
                  onChange={(e) => setFormData({ ...formData, horarioFin: e.target.value })}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={loading}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                editando ? 'Actualizar' : 'Guardar'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <SeleccionarProfesorModal
        open={openProfesorModal}
        onClose={() => setOpenProfesorModal(false)}
        profesores={profesores}
        onSelectProfesor={handleSelectProfesor}
        loading={loading}
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

export default Materias;
