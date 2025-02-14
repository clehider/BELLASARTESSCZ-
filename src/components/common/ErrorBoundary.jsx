import React from 'react';
import { Container, Alert, Button, Typography, Box } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom>
              Algo salió mal
            </Typography>
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={this.handleReload}>
                  Recargar página
                </Button>
              }
              sx={{ mb: 2 }}
            >
              {this.state.error?.message || 'Error al cargar el contenido'}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Si el problema persiste, por favor contacte al administrador
            </Typography>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
