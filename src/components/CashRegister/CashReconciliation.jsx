import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const CashReconciliation = ({ transactions, registerData, onReconcile }) => {
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!adjustmentAmount || !adjustmentReason) {
      setError('Por favor complete todos los campos');
      return;
    }

    try {
      await onReconcile({
        amount: parseFloat(adjustmentAmount),
        reason: adjustmentReason,
        timestamp: new Date(),
      });

      setAdjustmentAmount('');
      setAdjustmentReason('');
      setError('');
    } catch (err) {
      setError('Error al realizar el ajuste');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Conciliación de Caja
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1">
              Balance Actual: ${registerData.currentBalance}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Monto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {transaction.timestamp.toDate().toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {transaction.type === 'income' ? 'Ingreso' : 'Egreso'}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell align="right">
                      ${transaction.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Monto de Ajuste"
            type="number"
            value={adjustmentAmount}
            onChange={(e) => setAdjustmentAmount(e.target.value)}
            helperText="Use valores negativos para ajustes de reducción"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Razón del Ajuste"
            value={adjustmentReason}
            onChange={(e) => setAdjustmentReason(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            color="warning"
          >
            Realizar Ajuste
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CashReconciliation;
