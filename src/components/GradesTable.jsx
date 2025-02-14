import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

const GradesTable = ({ grades }) => {
  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Calificaciones
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Materia</TableCell>
            <TableCell>Nota</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Profesor</TableCell>
            <TableCell>Comentarios</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grades.map((grade) => (
            <TableRow key={grade.id}>
              <TableCell>{grade.subjectName}</TableCell>
              <TableCell>{grade.grade}</TableCell>
              <TableCell>{new Date(grade.date).toLocaleDateString()}</TableCell>
              <TableCell>{grade.teacherName}</TableCell>
              <TableCell>{grade.comments}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GradesTable;
