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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const Asistencia = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAsistencia, setSelectedAsistencia] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const { currentUser, userRole } = useAuth();

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    estudianteId: '',
    materiaId: '',
    presente: true,
    justificacion: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar estudiantes
        const estudiantesSnap = await getDocs(collection(db, 'estudiantes'));
        const estudiantesData = estudiantesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEstudiantes(estudiantesData);

        // Cargar materias
        const materiasSnap = await getDocs(collection(db, 'materias'));
        const materiasData = materiasSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMaterias(materiasData);

        // Cargar asistencias
        let asistenciasQuery;
        if (userRole === 'estudiante') {
          asistenciasQuery = query(
            collection(db, 'asistencias'),
            where('estudianteId', '==', currentUser.uid),
            orderBy('fecha', 'desc')
          );
        } else {
          asistenciasQuery = query(
            collection(db, 'asistencias'),
            orderBy('fecha', 'desc')
          );
        }

        const querySnapshot = await getDocs(asistenciasQuery);
        const asistenciasData = [];
        
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const estudiante = estudiantesData.find(e => e.id === data.estudianteId);
          const materia = materiasData.find(m => m.id === data.materiaId);
          
          asistenciasData.push({
            id: doc.id,
            ...data,
            estudianteNombre: estudiante?.nombre || 'Estudiante no encontrado',
            materiaNombre: materia?.nombre || 'Materia no encontrada',
          });
        }

        setAsistencias(asistenciasData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, userRole]);

  const handleOpenDialog = (asistencia = null) => {
    if (asistencia) {
      setSelectedAsistencia(asistencia);
      setFormData({
        fecha: asistencia.fecha.split('T')[0],
        estudianteId: asistencia.estudianteId,
        materiaId: asistencia.materiaId,
        presente: asistencia.presente,
        justificacion: asistencia.justificacion || '',
      });
    } else {
      setSelectedAsistencia(null);
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        estudianteId: '',
        materiaId: '',
        presente: true,
        justificacion: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAsistencia(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const asistenciaData = {
        fecha: formData.fecha,
        estudianteId: formData.estudianteId,
        materiaId: formData.materiaId,
        presente: formData.presente,
        justificacion: formData.justificacion,
        registradoPor: currentUser.uid,
        updatedAt: new Date().toISOString(),
      };

      if (selectedAsistencia) {
        await updateDoc(doc(db, 'asistencias', selectedAsistencia.id), asistenciaData);
      } else {
        await addDoc(collection(db, 'asistencias'), {
          ...asistenciaData,
          createdAt: new Date().toISOString(),
        });
      }

      handleCloseDialog();
      window.location.reload();
    } catch (error) {
      console.error('Error saving asistencia:', error);
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
          Control de Asistencia
        </Typography>
        {userRole !== 'estudiante' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog()}
          >
            Registrar Asistencia
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Estudiante</TableCell>
              <TableCell>Materia</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Justificación</TableCell>
              {userRole !== 'estudiante' && <TableCell>Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {asistencias.map((asistencia) => (
              <TableRow key={asistencia.id}>
                <TableCell>{new Date(asistencia.fecha).toLocaleDateString()}</TableCell>
                <TableCell>{asistencia.estudianteNombre}</TableCell>
                <TableCell>{asistencia.materiaNombre}</TableCell>
                <TableCell>
                  {asistencia.presente ? 'Presente' : 'Ausente'}
                </TableCell>
                <TableCell>{asistencia.justificacion}</TableCell>
                {userRole !== 'estudiante' && (
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleOpenDialog(asistencia)}
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
          {selectedAsistencia ? 'Editar Asistencia' : 'Registrar Asistencia'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              type="date"
              label="Fecha"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              margin="normal"
              required
              fullWidth
              label="Estudiante"
              value={formData.estudianteId}
              onChange={(e) => setFormData({ ...formData, estudianteId: e.target.value })}
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
              value={formData.materiaId}
              onChange={(e) => setFormData({ ...formData, materiaId: e.target.value })}
            >
              {materias.map((materia) => (
                <MenuItem key={materia.id} value={materia.id}>
                  {materia.nombre}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.presente}
                  onChange={(e) => setFormData({ ...formData, presente: e.target.checked })}
                  color="primary"
                />
              }
              label="Presente"
              sx={{ mt: 2 }}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Justificación"
              multiline
              rows={4}
              value={formData.justificacion}
              onChange={(e) => setFormData({ ...formData, justificacion: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedAsistencia ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Asistencia;
