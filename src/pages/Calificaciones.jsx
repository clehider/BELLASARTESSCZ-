import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const Calificaciones = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCalificacion, setSelectedCalificacion] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const { currentUser, userRole } = useAuth();

  const [formData, setFormData] = useState({
    estudiante: '',
    materia: '',
    modulo: '',
    calificacion: '',
    observaciones: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        let calificacionesQuery;
        
        if (userRole === 'estudiante') {
          calificacionesQuery = query(
            collection(db, 'calificaciones'),
            where('estudianteId', '==', currentUser.uid)
          );
        } else {
          calificacionesQuery = collection(db, 'calificaciones');
        }

        // Obtener calificaciones
        const querySnapshot = await getDocs(calificacionesQuery);
        const calificacionesData = [];
        
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          // Obtener datos adicionales de materia y estudiante
          const materiaDoc = await getDocs(query(collection(db, 'materias'), where('id', '==', data.materiaId)));
          const estudianteDoc = await getDocs(query(collection(db, 'estudiantes'), where('id', '==', data.estudianteId)));
          
          calificacionesData.push({
            id: doc.id,
            ...data,
            materiaNombre: materiaDoc.docs[0]?.data()?.nombre || 'Materia no encontrada',
            estudianteNombre: estudianteDoc.docs[0]?.data()?.nombre || 'Estudiante no encontrado',
          });
        }

        setCalificaciones(calificacionesData);

        // Cargar materias y estudiantes si el usuario es profesor o admin
        if (userRole !== 'estudiante') {
          const materiasSnapshot = await getDocs(collection(db, 'materias'));
          const materiasData = materiasSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMaterias(materiasData);

          const estudiantesSnapshot = await getDocs(collection(db, 'estudiantes'));
          const estudiantesData = estudiantesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setEstudiantes(estudiantesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, userRole]);

  const handleOpenDialog = (calificacion = null) => {
    if (calificacion) {
      setSelectedCalificacion(calificacion);
      setFormData({
        estudiante: calificacion.estudianteId,
        materia: calificacion.materiaId,
        modulo: calificacion.modulo,
        calificacion: calificacion.calificacion,
        observaciones: calificacion.observaciones || ''
      });
    } else {
      setSelectedCalificacion(null);
      setFormData({
        estudiante: '',
        materia: '',
        modulo: '',
        calificacion: '',
        observaciones: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCalificacion(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const calificacionData = {
        estudianteId: formData.estudiante,
        materiaId: formData.materia,
        modulo: formData.modulo,
        calificacion: parseFloat(formData.calificacion),
        observaciones: formData.observaciones,
        fecha: new Date().toISOString(),
        profesorId: currentUser.uid
      };

      if (selectedCalificacion) {
        await updateDoc(doc(db, 'calificaciones', selectedCalificacion.id), calificacionData);
      } else {
        await addDoc(collection(db, 'calificaciones'), calificacionData);
      }

      handleCloseDialog();
      window.location.reload();
    } catch (error) {
      console.error('Error saving calificacion:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Calificaciones
        </Typography>
        {userRole !== 'estudiante' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog()}
          >
            Nueva Calificación
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estudiante</TableCell>
              <TableCell>Materia</TableCell>
              <TableCell>Módulo</TableCell>
              <TableCell>Calificación</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Observaciones</TableCell>
              {userRole !== 'estudiante' && <TableCell>Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {calificaciones.map((calificacion) => (
              <TableRow key={calificacion.id}>
                <TableCell>{calificacion.estudianteNombre}</TableCell>
                <TableCell>{calificacion.materiaNombre}</TableCell>
                <TableCell>{calificacion.modulo}</TableCell>
                <TableCell>{calificacion.calificacion}</TableCell>
                <TableCell>{new Date(calificacion.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{calificacion.observaciones}</TableCell>
                {userRole !== 'estudiante' && (
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleOpenDialog(calificacion)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCalificacion ? 'Editar Calificación' : 'Nueva Calificación'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              select
              margin="normal"
              required
              fullWidth
              label="Estudiante"
              value={formData.estudiante}
              onChange={(e) => setFormData({ ...formData, estudiante: e.target.value })}
              disabled={userRole === 'estudiante'}
            >
              {estudiantes.map((estudiante) => (
                <MenuItem key={estudiante.id} value={estudiante.id}>
                  {estudiante.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              margin="normal"
              required
              fullWidth
              label="Materia"
              value={formData.materia}
              onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
            >
              {materias.map((materia) => (
                <MenuItem key={materia.id} value={materia.id}>
                  {materia.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              margin="normal"
              required
              fullWidth
              label="Módulo"
              value={formData.modulo}
              onChange={(e) => setFormData({ ...formData, modulo: e.target.value })}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Calificación"
              type="number"
              inputProps={{ min: 0, max: 100, step: 1 }}
              value={formData.calificacion}
              onChange={(e) => setFormData({ ...formData, calificacion: e.target.value })}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Observaciones"
              multiline
              rows={4}
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCalificacion ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Calificaciones;
