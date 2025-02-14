import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Box,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

const ExpenseSummary = ({ summary }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Total Mensual
          </Typography>
          <Typography variant="h4">
            ${summary.monthlyTotal.toFixed(2)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {summary.monthlyChange >= 0 ? (
              <TrendingUp color="error" />
            ) : (
              <TrendingDown color="success" />
            )}
            <Typography
              variant="body2"
              color={summary.monthlyChange >= 0 ? 'error' : 'success'}
              sx={{ ml: 1 }}
            >
              {Math.abs(summary.monthlyChange).toFixed(2)}% vs mes anterior
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Presupuesto Mensual
          </Typography>
          <Typography variant="h4">
            ${summary.monthlyBudget.toFixed(2)}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={(summary.monthlyTotal / summary.monthlyBudget) * 100}
              color={summary.monthlyTotal > summary.monthlyBudget ? 'error' : 'primary'}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Desglose por Categoría
          </Typography>
          {summary.categoryBreakdown.map((category) => (
            <Box key={category.id} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {category.name}
                </Typography>
                <Typography variant="body2">
                  ${category.spent.toFixed(2)} / ${category.limit.toFixed(2)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(category.spent / category.limit) * 100}
                color={category.spent > category.limit ? 'error' : 'primary'}
              />
            </Box>
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ExpenseSummary;
