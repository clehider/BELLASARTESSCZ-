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
  AttachMoney,
  Timeline,
  ShowChart,
} from '@mui/icons-material';

const MetricCard = ({ title, value, change, icon: Icon }) => (
  <Paper sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Icon sx={{ mr: 1 }} />
      <Typography variant="h6" component="div">
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" component="div" gutterBottom>
      ${value.toLocaleString()}
    </Typography>
    {change != null && (
      <Chip
        icon={change >= 0 ? <TrendingUp /> : <TrendingDown />}
        label={`${Math.abs(change)}% vs período anterior`}
        color={change >= 0 ? 'error' : 'success'}
        size="small"
      />
    )}
  </Paper>
);

const KeyMetrics = ({ metrics }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={3}>
        <MetricCard
          title="Total Gastos"
          value={metrics.totalExpenses}
          change={metrics.expenseChange}
          icon={AttachMoney}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <MetricCard
          title="Promedio Mensual"
          value={metrics.monthlyAverage}
          icon={Timeline}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <MetricCard
          title="Gasto Máximo"
          value={metrics.maxExpense}
          icon={ShowChart}
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <MetricCard
          title="Presupuesto Disponible"
          value={metrics.availableBudget}
          change={metrics.budgetUtilization}
          icon={AttachMoney}
        />
      </Grid>
    </Grid>
  );
};

export default KeyMetrics;
