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
  MenuItem,
  Avatar,
  InputAdornment,
  Tooltip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const EstudiantesPage = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEstudiante, setCurrentEstudiante] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    moduloId: '',
    fechaNacimiento: '',
    direccion: '',
    estado: 'activo',
    observaciones: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [estudiantesSnapshot, modulosSnapshot] = await Promise.all([
        getDocs(collection(db, 'estudiantes')),
        getDocs(collection(db, 'modulos'))
      ]);

      const estudiantesData = estudiantesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaInscripcion: doc.data().fechaInscripcion?.toDate() || new Date()
      }));

      const modulosData = modulosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setEstudiantes(estudiantesData);
      setModulos(modulosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (estudiante = null) => {
    if (estudiante) {
      setCurrentEstudiante(estudiante);
      setFormData({
        nombre: estudiante.nombre || '',
        apellido: estudiante.apellido || '',
        email: estudiante.email || '',
        telefono: estudiante.telefono || '',
        moduloId: estudiante.moduloId || '',
        fechaNacimiento: estudiante.fechaNacimiento || '',
        direccion: estudiante.direccion || '',
        estado: estudiante.estado || 'activo',
        observaciones: estudiante.observaciones || ''
      });
    } else {
      setCurrentEstudiante(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        moduloId: '',
        fechaNacimiento: '',
        direccion: '',
        estado: 'activo',
        observaciones: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentEstudiante(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentEstudiante) {
        await updateDoc(doc(db, 'estudiantes', currentEstudiante.id), {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'estudiantes'), {
          ...formData,
          fechaInscripcion: new Date()
        });
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error al guardar:', error);
      setError('Error al guardar el estudiante');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este estudiante?')) {
      try {
        await deleteDoc(doc(db, 'estudiantes', id));
        fetchData();
      } catch (error) {
        console.error('Error al eliminar:', error);
        setError('Error al eliminar el estudiante');
      }
    }
  };

  const filteredEstudiantes = estudiantes.filter(estudiante =>
    estudiante.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estudiante.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          Estudiantes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Estudiante
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar estudiante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Estudiante</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Módulo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEstudiantes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((estudiante) => (
                  <TableRow key={estudiante.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {estudiante.nombre?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {estudiante.nombre} {estudiante.apellido}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {estudiante.id.slice(0, 8)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{estudiante.email}</TableCell>
                    <TableCell>{estudiante.telefono}</TableCell>
                    <TableCell>
                      {modulos.find(m => m.id === estudiante.moduloId)?.nombre || '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={estudiante.estado}
                        color={estudiante.estado === 'activo' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(estudiante)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(estudiante.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredEstudiantes.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentEstudiante ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Nombre"
                  fullWidth
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Apellido"
                  fullWidth
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Email"
                  type="email"
                  fullWidth
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Teléfono"
                  fullWidth
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  label="Fecha de Nacimiento"
                  type="date"
                  fullWidth
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Dirección"
                  fullWidth
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Observaciones"
                  fullWidth
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentEstudiante ? 'Guardar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default EstudiantesPage;
