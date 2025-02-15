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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { db } from '../firebase/config';

const Estudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
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
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: ''
  });

  const fetchEstudiantes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'estudiantes'));
      const estudiantesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEstudiantes(estudiantesData);
    } catch (error) {
      console.error('Error:', error);
      mostrarSnackbar('Error al cargar los estudiantes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
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
      email: '',
      password: '',
      telefono: '',
      direccion: '',
      fecha_nacimiento: ''
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
      ...estudiante,
      password: '' // La contraseña no se carga por seguridad
    });
    setOpen(true);
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingData(true);

    try {
      if (!validateEmail(formData.email)) {
        throw new Error('Email inválido');
      }

      const estudianteData = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        ci: formData.ci,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        fecha_nacimiento: formData.fecha_nacimiento,
        fechaActualizacion: new Date().toISOString()
      };

      if (editando) {
        await updateDoc(doc(db, 'estudiantes', editando), estudianteData);
        mostrarSnackbar('Estudiante actualizado exitosamente', 'success');
      } else {
        // Verificar si el email ya existe
        const emailQuery = query(collection(db, 'estudiantes'), where('email', '==', formData.email));
        const emailSnapshot = await getDocs(emailQuery);
        
        if (!emailSnapshot.empty) {
          throw new Error('El email ya está registrado');
        }

        if (!formData.password || formData.password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Crear usuario en Authentication
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Agregar estudiante a Firestore
        estudianteData.fechaCreacion = new Date().toISOString();
        estudianteData.uid = userCredential.user.uid;
        
        await addDoc(collection(db, 'estudiantes'), estudianteData);
        mostrarSnackbar('Estudiante registrado exitosamente', 'success');
      }

      handleClose();
      await fetchEstudiantes();
    } catch (error) {
      console.error('Error:', error);
      mostrarSnackbar(
        error.message || 'Error al guardar el estudiante',
        'error'
      );
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este estudiante?')) {
      setLoadingData(true);
      try {
        await deleteDoc(doc(db, 'estudiantes', id));
        mostrarSnackbar('Estudiante eliminado exitosamente', 'success');
        await fetchEstudiantes();
      } catch (error) {
        console.error('Error:', error);
        mostrarSnackbar('Error al eliminar el estudiante', 'error');
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
          Gestión de Estudiantes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
          disabled={loadingData}
        >
          Nuevo Estudiante
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
              <TableCell>Teléfono</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estudiantes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay estudiantes registrados
                </TableCell>
              </TableRow>
            ) : (
              estudiantes.map((estudiante) => (
                <TableRow key={estudiante.id}>
                  <TableCell>{estudiante.ci}</TableCell>
                  <TableCell>{estudiante.nombre}</TableCell>
                  <TableCell>{estudiante.apellidos}</TableCell>
                  <TableCell>{estudiante.email}</TableCell>
                  <TableCell>{estudiante.telefono}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(estudiante)}
                      disabled={loadingData}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(estudiante.id)}
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
          {editando ? 'Editar Estudiante' : 'Nuevo Estudiante'}
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
                  disabled={loadingData || editando}
                  helperText={editando ? "El email no se puede modificar" : ""}
                />
              </Grid>
              {!editando && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="dense"
                    label="Contraseña"
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editando}
                    disabled={loadingData}
                    helperText="Mínimo 6 caracteres"
                  />
                </Grid>
              )}
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
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Dirección"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  disabled={loadingData}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Fecha de Nacimiento"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={loadingData}
                />
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

export default Estudiantes;
