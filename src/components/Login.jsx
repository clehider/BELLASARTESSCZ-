import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('admin@bellasartes.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar el estado de autenticación actual
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Estado de autenticación actual:', user ? 'Autenticado' : 'No autenticado');
      if (user) {
        console.log('Usuario autenticado:', user.email);
        setDebugInfo(prev => prev + '\nUsuario ya autenticado: ' + user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDebugInfo('Iniciando proceso de login...');

    try {
      console.log('Intentando iniciar sesión con:', email);
      setDebugInfo(prev => prev + '\nIntentando login con: ' + email);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login exitoso:', userCredential.user);
      setDebugInfo(prev => prev + '\nLogin exitoso. UID: ' + userCredential.user.uid);

      // Verificar claims de administrador
      const idTokenResult = await userCredential.user.getIdTokenResult();
      console.log('Claims del usuario:', idTokenResult.claims);
      setDebugInfo(prev => prev + '\nClaims: ' + JSON.stringify(idTokenResult.claims));

      navigate('/');
    } catch (error) {
      console.error('Error completo:', error);
      setDebugInfo(prev => prev + '\nError: ' + error.code + ' - ' + error.message);

      let errorMessage = 'Error al iniciar sesión. ';
      switch (error.code) {
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
          errorMessage = `Error: ${error.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" gutterBottom>
            Bellas Artes SCZ
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
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
                Credenciales por defecto:
                <br />
                Email: admin@bellasartes.com
                <br />
                Contraseña: Admin123!
              </Typography>
            </Alert>

            {/* Información de depuración */}
            {debugInfo && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="caption" component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                  {debugInfo}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
