import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const GradeManagement = ({ students, courseId, onSaveGrades }) => {
  const [grades, setGrades] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleGradeChange = (studentId, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await onSaveGrades(courseId, grades);
      setSuccess(true);
      setGrades({});
    } catch (err) {
      setError('Error al guardar las calificaciones');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Gestión de Calificaciones
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Calificaciones guardadas exitosamente
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estudiante</TableCell>
              <TableCell>CI</TableCell>
              <TableCell>Nota Actual</TableCell>
              <TableCell>Nueva Nota</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.ci}</TableCell>
                <TableCell>{student.currentGrade || 'N/A'}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    value={grades[student.id] || ''}
                    onChange={(e) => handleGradeChange(student.id, e.target.value)}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Calificaciones'}
        </Button>
      </Box>
    </Box>
  );
};

export default GradeManagement;
