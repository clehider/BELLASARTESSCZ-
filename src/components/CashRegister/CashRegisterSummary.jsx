import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AddCircle,
  RemoveCircle,
} from '@mui/icons-material';

const CashRegisterSummary = ({ summary }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" gutterBottom>
              Saldo Actual
            </Typography>
            <Typography variant="h4" color="primary">
              ${summary.currentBalance.toFixed(2)}
            </Typography>
            <AccountBalance sx={{ mt: 1 }} />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" gutterBottom>
              Ingresos del Día
            </Typography>
            <Typography variant="h4" color="success.main">
              ${summary.dailyIncome.toFixed(2)}
            </Typography>
            <AddCircle color="success" sx={{ mt: 1 }} />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" gutterBottom>
              Egresos del Día
            </Typography>
            <Typography variant="h4" color="error.main">
              ${summary.dailyExpenses.toFixed(2)}
            </Typography>
            <RemoveCircle color="error" sx={{ mt: 1 }} />
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" gutterBottom>
              Balance del Día
            </Typography>
            <Typography 
              variant="h4" 
              color={summary.dailyBalance >= 0 ? 'success.main' : 'error.main'}
            >
              ${summary.dailyBalance.toFixed(2)}
            </Typography>
            {summary.dailyBalance >= 0 ? (
              <TrendingUp color="success" sx={{ mt: 1 }} />
            ) : (
              <TrendingDown color="error" sx={{ mt: 1 }} />
            )}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}>
            <Chip
              label={`Última apertura: ${summary.lastOpening}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Último cierre: ${summary.lastClosing}`}
              color="secondary"
              variant="outlined"
            />
            <Chip
              label={`Transacciones hoy: ${summary.dailyTransactions}`}
              color="info"
              variant="outlined"
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CashRegisterSummary;
