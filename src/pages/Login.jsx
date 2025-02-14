import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('admin@bellasartes.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  if (currentUser) {
    console.log('Usuario ya autenticado, redirigiendo...');
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Iniciando intento de login...');
    
    if (!email || !password) {
      setError('Por favor ingrese email y contraseña');
      return;
    }

    try {
      setError('');
      setLoading(true);
      console.log('Intentando login con:', email);
      const result = await login(email, password);
      console.log('Login exitoso:', result);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Error detallado:', err);
      let errorMessage = 'Error al iniciar sesión. ';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado. Verifique el correo electrónico.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta. Intente nuevamente.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Formato de correo electrónico inválido.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Por favor, espere unos minutos.';
          break;
        default:
          errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      console.error('Mensaje de error mostrado:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Bellas Artes SCZ
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Ingresar'}
            </Button>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Por favor, verifique que:
                <br />
                1. El usuario está creado en Firebase Authentication
                <br />
                2. La contraseña tiene al menos 6 caracteres
                <br />
                3. El correo tiene formato válido
              </Typography>
            </Alert>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
