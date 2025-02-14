import React, { createContext, useContext, useState } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const showLoading = (message = 'Cargando...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
        open={isLoading}
      >
        <div style={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <div style={{ marginTop: 10 }}>{loadingMessage}</div>
        </div>
      </Backdrop>
    </LoadingContext.Provider>
  );
};
