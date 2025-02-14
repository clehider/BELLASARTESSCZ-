import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={3}
        >
          <Typography variant="h4" gutterBottom>
            Algo salió mal
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Ha ocurrido un error en la aplicación.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Recargar página
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <Box mt={4}>
              <Typography variant="body2" color="error">
                {this.state.error && this.state.error.toString()}
              </Typography>
              <pre style={{ marginTop: '10px', color: 'red' }}>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
