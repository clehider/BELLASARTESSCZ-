import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const handleReturn = () => {
    if (!userRole) {
      navigate('/');
    } else if (userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            p: 5,
            textAlign: 'center',
            maxWidth: 400
          }}
        >
          <Typography variant="h1" sx={{ mb: 2, fontSize: '6rem', fontWeight: 'bold', color: 'primary.main' }}>
            404
          </Typography>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Página no encontrada
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </Typography>
          <Button
            variant="contained"
            onClick={handleReturn}
            sx={{ mr: 2 }}
          >
            Volver al Inicio
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;
