import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';

const DENOMINATIONS = [
  { value: 200, type: 'bill', label: 'Billetes de 200' },
  { value: 100, type: 'bill', label: 'Billetes de 100' },
  { value: 50, type: 'bill', label: 'Billetes de 50' },
  { value: 20, type: 'bill', label: 'Billetes de 20' },
  { value: 10, type: 'bill', label: 'Billetes de 10' },
  { value: 5, type: 'coin', label: 'Monedas de 5' },
  { value: 2, type: 'coin', label: 'Monedas de 2' },
  { value: 1, type: 'coin', label: 'Monedas de 1' },
  { value: 0.5, type: 'coin', label: 'Monedas de 0.50' },
  { value: 0.2, type: 'coin', label: 'Monedas de 0.20' },
  { value: 0.1, type: 'coin', label: 'Monedas de 0.10' },
];

const CashCount = ({ onSubmit, expectedAmount }) => {
  const [counts, setCounts] = useState(
    DENOMINATIONS.reduce((acc, denom) => ({
      ...acc,
      [denom.value]: 0
    }), {})
  );
  const [error, setError] = useState('');

  const handleCountChange = (denomination, count) => {
    setCounts(prev => ({
      ...prev,
      [denomination]: parseInt(count) || 0
    }));
  };

  const calculateTotal = () => {
    return Object.entries(counts).reduce(
      (total, [denom, count]) => total + (parseFloat(denom) * count),
      0
    );
  };

  const handleSubmit = () => {
    const total = calculateTotal();
    const difference = total - expectedAmount;
    
    onSubmit({
      counts,
      total,
      difference,
      timestamp: new Date(),
    });
  };

  const total = calculateTotal();
  const difference = total - expectedAmount;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Arqueo de Caja
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Monto Esperado: ${expectedAmount.toFixed(2)}
          </Typography>
        </Grid>

        {DENOMINATIONS.map((denom) => (
          <Grid item xs={12} sm={6} md={4} key={denom.value}>
            <TextField
              fullWidth
              label={denom.label}
              type="number"
              value={counts[denom.value]}
              onChange={(e) => handleCountChange(denom.value, e.target.value)}
              InputProps={{
                inputProps: { min: 0 }
              }}
              size="small"
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6">
              Total Contado: ${total.toFixed(2)}
            </Typography>
            <Typography
              variant="subtitle1"
              color={difference === 0 ? 'success.main' : 'error.main'}
            >
              Diferencia: ${difference.toFixed(2)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            color={difference === 0 ? 'primary' : 'warning'}
          >
            {difference === 0 ? 'Confirmar Arqueo' : 'Confirmar con Diferencia'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CashCount;
