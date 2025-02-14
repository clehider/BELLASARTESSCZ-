import React from 'react';
import { Typography, Container } from '@mui/material';

const Materias = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Materias
      </Typography>
      <Typography variant="body1">
        Contenido de Materias en construcción...
      </Typography>
    </Container>
  );
};

export default Materias;
