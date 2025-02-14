import { School as SchoolIcon } from "@mui/icons-material";
import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const StudentManagement = ({ students, courses, onAdd, onEdit, onDelete, onEnroll }) => {
  const [open, setOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    ci: '',
    email: '',
    phone: '',
    address: '',
  });

  // Resto del código continúa en la siguiente parte...
  const handleOpen = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData(student);
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        ci: '',
        email: '',
        phone: '',
        address: '',
      });
    }
    setOpen(true);
  };

  const handleEnrollOpen = (student) => {
    setEditingStudent(student);
    setSelectedCourses(student.courses || []);
    setEnrollOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingStudent(null);
  };

  const handleEnrollClose = () => {
    setEnrollOpen(false);
    setEditingStudent(null);
    setSelectedCourses([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await onEdit(editingStudent.id, formData);
      } else {
        await onAdd(formData);
      }
      handleClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEnrollSubmit = async () => {
    try {
      await onEnroll(editingStudent.id, selectedCourses);
      handleEnrollClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Gestión de Estudiantes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Nuevo Estudiante
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>CI</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.ci}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.phone}</TableCell>
                <TableCell>{student.address}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(student)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleEnrollOpen(student)}>
                    <SchoolIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(student.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar estudiante */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="CI"
              value={formData.ci}
              onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Dirección"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStudent ? 'Guardar Cambios' : 'Crear Estudiante'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para inscripción en cursos */}
      <Dialog open={enrollOpen} onClose={handleEnrollClose} maxWidth="sm" fullWidth>
        <DialogTitle>Inscribir en Cursos</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Cursos</InputLabel>
            <Select
              multiple
              value={selectedCourses}
              onChange={(e) => setSelectedCourses(e.target.value)}
              renderValue={(selected) => selected.map(id => 
                courses.find(course => course.id === id)?.name
              ).join(', ')}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEnrollClose}>Cancelar</Button>
          <Button onClick={handleEnrollSubmit} variant="contained">
            Guardar Inscripciones
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentManagement;
