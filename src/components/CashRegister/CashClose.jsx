import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CashCount from './CashCount';

const CashClose = ({ registerData, onClose }) => {
  const [showCashCount, setShowCashCount] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleCashCount = async (countData) => {
    try {
      await onClose({
        ...countData,
        notes,
        closedAt: new Date(),
      });
      setShowCashCount(false);
    } catch (err) {
      setError('Error al cerrar la caja');
    }
  };

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cierre de Caja
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Balance Inicial: ${registerData.initialAmount}
              </Typography>
              <Typography variant="subtitle1">
                Total Ingresos: ${registerData.totalIncome}
              </Typography>
              <Typography variant="subtitle1">
                Total Egresos: ${registerData.totalExpenses}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Balance Final: ${registerData.currentBalance}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notas de Cierre"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setShowCashCount(true)}
            >
              Realizar Arqueo y Cerrar Caja
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={showCashCount}
        onClose={() => setShowCashCount(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Arqueo de Caja</DialogTitle>
        <DialogContent>
          <CashCount
            expectedAmount={registerData.currentBalance}
            onSubmit={handleCashCount}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCashCount(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CashClose;
